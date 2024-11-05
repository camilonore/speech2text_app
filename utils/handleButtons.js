import { createTranscription, getTranscriptionStatus, getTranscriptionText } from './azure.js'
import { BlobServiceClient } from '@azure/storage-blob'

const containerName = 'transcriptions-container'
const account = import.meta.env.VITE_AZURE_STORAGE_ACCOUNT
const sasToken = import.meta.env.VITE_SAS_TOKEN
const blobServiceClient = new BlobServiceClient(`${account}?${sasToken}`)

const uploadFileToBlob = async (file) => {
  const containerClient = blobServiceClient.getContainerClient(containerName)
  const blockBlobClient = containerClient.getBlockBlobClient(file.name)
  try {
    const response = await blockBlobClient.upload(file, file.size)
    return {'ok':true, data:response}
  } catch (error) {
    return {'ok':false, error}
  }
}

const handleTranscription = async (file) => {
  try {
    const result = await createTranscription(account, containerName, file.name, sasToken)
    return {'ok':true, data:result}
  } catch (error) {
    console.error("Transcription failed:", error.message)
    return {'ok':false, error}
  }
}

const checkTranscriptionStatus = async () => {
  const transcriptionId = localStorage.getItem('transcriptionId')
  if (!transcriptionId) {
    console.error("Transcription ID not found")
    return {'ok':false, error:'Transcription ID not found'}
  }
  try {
    const transcriptionStatus =  await getTranscriptionStatus(transcriptionId)
    return {'ok':true, data:transcriptionStatus}
  } catch (error) {
    console.error("Transcription status failed:", error.message)
    return {'ok':false, error}
  }
}

const fetchTranscriptionText = async () => {
  const transcriptionId = localStorage.getItem('transcriptionId')
  if (!transcriptionId) {
    console.error("Transcription ID not found")
    return {'ok':false, error:'Transcription ID not found'}
  }
  try {
    const transcription = await getTranscriptionText(transcriptionId)
    const transcriptionLink = transcription.values[0].links.contentUrl
    const response = await fetch(transcriptionLink)
    const data = await response.json()
    return {'ok':true, data}
  } catch (error) {
    console.error("Transcription text failed:", error.message)
    return {'ok':false, error}
  }
}

export { uploadFileToBlob, handleTranscription, checkTranscriptionStatus, fetchTranscriptionText }