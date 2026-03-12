function cleanName(name) {
  try {
      return name
      .replace(/[^a-zA-Z\s]/g, "") // remove symbols
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ") // collapse spaces
    .replace(/\b\w/g, (c) => c.toUpperCase()); // capitalize first letter
  } catch (error) {
    
    console.log(error);
    return name;
  }
}
export default cleanName;