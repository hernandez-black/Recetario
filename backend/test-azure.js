const axios = require('axios');

async function test() {
  try {
    const responseText = await axios.post(
      'https://recetas-utsh-prueba.cognitiveservices.azure.com/contentsafety/text:analyze?api-version=2023-10-01',
      {
        text: "This is a test message to see if it works",
      },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': '5IhftFjkMfmUaMM82Argq67wXaFStVL8pvjhUZHTDtLkJjK26aOaJQQJ99CDACYeBjFXJ3w3AAAHAcOGZk3V',
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Success with Key 2:", JSON.stringify(responseText.data, null, 2));
  } catch (err) {
    console.error("Key 2 Error:", err.response ? err.response.data : err.message);
  }

  try {
    const responseText1 = await axios.post(
      'https://recetas-utsh-prueba.cognitiveservices.azure.com/contentsafety/text:analyze?api-version=2023-10-01',
      {
        text: "This is a test message to see if it works",
      },
      {
        headers: {
          'Ocp-Apim-Subscription-Key': 'GIofTViFyqGwCmdqBEwx6qaM7bTheuaRZTAdhGv8J3R5cTEtsknHJQQJ99CDACYeBjFXJ3w3AAAHAcOGKY34',
          'Content-Type': 'application/json'
        }
      }
    );
    console.log("Success with Key 1:", JSON.stringify(responseText1.data, null, 2));
  } catch (err) {
    console.error("Key 1 Error:", err.response ? err.response.data : err.message);
  }
}

test();
