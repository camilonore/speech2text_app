function getTranscriptionId(url) {
  const parts = url.split("/")
  return parts[parts.length - 1]
}

export { getTranscriptionId }