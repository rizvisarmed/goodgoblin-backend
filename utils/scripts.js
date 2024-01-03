const convertToNumber = (value) => {
  return isNaN(value) ? 500 : parseInt(value);
};

const convertToText = (text, demoText) => {
  return isNaN(text) ? text : demoText;
};

const optionalProperty = (propName, value, demoValue = null) => {
  return {
    [propName]:
      !value || value.toString() === "Invalid Date" ? demoValue : value,
  };
};

const categorizeElements = (array) => {
  let result = {
    text: "",
    letters: [],
    numbers: [],
  };

  array.forEach((element) => {
    if (typeof element === "string") {
      if (element.match(/^[a-z]$/i)) {
        result.letters.push(element);
      } else if (element.match(/^\d+$/)) {
        result.numbers.push(parseInt(element));
      } else {
        result.text += element;
      }
    }
  });

  return result;
};

module.exports = {
  convertToNumber,
  convertToText,
  optionalProperty,
  categorizeElements,
};
