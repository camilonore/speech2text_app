import { uploadFileToBlob, handleTranscription, checkTranscriptionStatus, fetchTranscriptionText } from './utils/handleButtons.js'
import { getTranscriptionId } from './utils/other.js'

const audioForm = document.getElementById('audioForm')
const audioFile = document.getElementById('audioFile')
const generateButton = document.getElementById('generateButton')
const statusButton = document.getElementById('statusButton')
const transcriptionButton = document.getElementById('transcriptionButton')

const uploadedText = document.getElementById('uploadedText')
const generatedText = document.getElementById('generatedText')
const statusText = document.getElementById('statusText')
const transcriptionText = document.getElementById('transcriptionText')

alert('Hola, bienvenido a la aplicación de transcripción de audio. Por favor, sube un archivo de audio y presiona el botón "Generar Transcripción" para comenzar el proceso.')

audioForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  uploadedText.textContent = "Subiendo archivo..."
  const file = audioFile.files[0]
  const response = await uploadFileToBlob(file)

  if (response.ok) {
    console.log("File uploaded successfully", response.data)
    uploadedText.textContent = "Archivo Subido correctamente"
  } else {
    uploadedText.textContent = "Error subiendo archivo"
    console.error("File upload failed:", response.error)
  }
})

generateButton.addEventListener('click', async (e) => {
  console.log("Generating transcription...")
  e.preventDefault()
  generatedText.textContent = "Cargando..."
  const file = audioFile.files[0]
  const response = await handleTranscription(file)
  if (response.ok){
    const transcriptionId = getTranscriptionId(response.data.self)
    localStorage.setItem('transcriptionId', transcriptionId)
    console.log("Transcription ID:", transcriptionId)
    generatedText.textContent = "Transcripción iniciada"
  } else {
    generatedText.textContent = "Error en la generación"
    console.error("Transcription failed:", response.error)
  }
})

statusButton.addEventListener('click', async (e) => {
  e.preventDefault()
  statusText.textContent = "Cargando..."
  const response = await checkTranscriptionStatus()
  if (response.ok) {
    let status = response.data.status
    if (status == 'Succeeded') status = 'Listo'
    if (status == 'Running') status = 'En Proceso'
    console.log("Transcription status:", status)
    statusText.textContent = status
  } else {
    statusText.textContent = "No se pudo obtener el estado"
    console.error("Transcription status failed:", response.error)
  }
})

transcriptionButton.addEventListener('click', async (e) => {
  e.preventDefault()
  transcriptionText.textContent = "Cargando..."
  const response = await fetchTranscriptionText()

  if (response.ok) {
    const textContent = response.data.combinedRecognizedPhrases[0].display
    transcriptionText.textContent = textContent
  } else {
    transcriptionText.textContent = "Error obteniendo la transcripción"
    console.error("Transcription text failed:", response.error)
  }
})
