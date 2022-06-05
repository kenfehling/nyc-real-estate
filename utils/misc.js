const transposeArray = (array) => {
  const arrayLength = array[0].length;  // Assume all the same length
  let newArray = [];
  for (let i = 0; i < arrayLength; i++) {
    newArray.push([]);
  }
  for (let i = 0; i < array.length; i++){
    for (let j = 0; j < arrayLength; j++){
      newArray[j].push(array[i][j]);
    }
  }
  return newArray;
}