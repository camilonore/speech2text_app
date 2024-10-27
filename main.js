import { BlobServiceClient } from '@azure/storage-blob';
import { createTranscription, getTranscriptionStatus, getTranscriptionText } from './utils/azure.js';

const audioForm = document.getElementById('audioForm');
const audioFile = document.getElementById('audioFile');
const generateButton = document.getElementById('generateButton');
const statusButton = document.getElementById('statusButton');
const transcriptionButton = document.getElementById('transcriptionButton');
const transcriptionText = document.getElementById('transcriptionText');

const containerName = 'transcriptions-container';
const account = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT;
const sasToken = import.meta.env.VITE_SAS_TOKEN;
const blobServiceClient = new BlobServiceClient(`${account}?${sasToken}`);

const uploadFileToBlob = async (file) => {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(file.name);
  try {
    const response = await blockBlobClient.upload(file, file.size);
    console.log("Upload complete:", response.requestId);
  } catch (error) {
    console.error("Upload failed:", error.message);
    throw error;
  }
};

const handleTranscription = async (file) => {
  try {
    const transcriptionId = await createTranscription(account, containerName, file.name, sasToken);
    localStorage.setItem('transcriptionId', transcriptionId);
  } catch (error) {
    console.error("Transcription failed:", error.message);
    throw error;
  }
};

const checkTranscriptionStatus = async () => {
  const transcriptionId = localStorage.getItem('transcriptionId');
  if (!transcriptionId) {
    console.error("Transcription ID not found");
    return;
  }
  try {
    await getTranscriptionStatus(transcriptionId);
  } catch (error) {
    console.error("Transcription status failed:", error.message);
    throw error;
  }
};

const fetchTranscriptionText = async () => {
  const transcriptionId = localStorage.getItem('transcriptionId');
  if (!transcriptionId) {
    console.error("Transcription ID not found");
    return;
  }
  try {
    const transcription = await getTranscriptionText(transcriptionId);
    const transcriptionLink = transcription.values[0].links.contentUrl;
    const response = await fetch(transcriptionLink);
    const data = await response.json();
    const textContent = data.combinedRecognizedPhrases[0].display;
    transcriptionText.textContent = textContent;
  } catch (error) {
    console.error("Transcription text failed:", error.message);
    throw error;
  }
};

audioForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = audioFile.files[0];
  await uploadFileToBlob(file);
});

generateButton.addEventListener('click', async (e) => {
  e.preventDefault();
  const file = audioFile.files[0];
  await handleTranscription(file);
});

statusButton.addEventListener('click', async (e) => {
  e.preventDefault();
  await checkTranscriptionStatus();
});

transcriptionButton.addEventListener('click', async (e) => {
  e.preventDefault();
  await fetchTranscriptionText();
});
