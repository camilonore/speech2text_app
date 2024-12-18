const subscriptionKey = import.meta.env.VITE_AZURE_SPEECH_KEY;
const baseUrl = "https://eastus.api.cognitive.microsoft.com/speechtotext/v3.2";
const containerUrl = import.meta.env.VITE_AZURE_STORAGE_URL;

async function fetchFromAzure(url, options) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

export async function createTranscription(account, containerName, blobName, sasToken) {
  const url = `${baseUrl}/transcriptions`;
  const urlContent = `${account}/${containerName}/${blobName}?${sasToken}`;
  const requestBody = {
    contentUrls: [urlContent],
    locale: "es-CO",
    displayName: "My Transcription",
    model: {
      self: `${baseUrl}/models/base/e418c4a9-9937-4db7-b2c9-8afbff72d950`
    },
    properties: {
      wordLevelTimestampsEnabled: false,
      displayFormWordLevelTimestampsEnabled: true,
      diarizationEnabled: false,
      punctuationMode: "DictatedAndAutomatic",
      profanityFilterMode: "Masked",
      destinationContainerUrl: containerUrl,
      timeToLive: "PT2H"
    }
  };

  const options = {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  };

  const result = await fetchFromAzure(url, options);
  return result;
}

export async function getTranscriptionStatus(transcriptionId) {
  const url = `${baseUrl}/transcriptions/${transcriptionId}`;
  const options = {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  };

  const result = await fetchFromAzure(url, options);
  return result;
}

export async function getTranscriptionText(transcriptionId) {
  const url = `${baseUrl}/transcriptions/${transcriptionId}/files`;
  const options = {
    method: "GET",
    headers: {
      "Ocp-Apim-Subscription-Key": subscriptionKey
    }
  };

  const result = await fetchFromAzure(url, options);
  return result;
}
