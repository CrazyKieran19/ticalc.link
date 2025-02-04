(()=>{ 
  const { ticalc, tifiles } = require('ticalc-usb');

  let calculator = null;
  let file = null;

  function updateButtons() {
    document.querySelectorAll(".buttons button").forEach(b => b.classList.remove("active", "complete"));

    if (calculator) document.querySelector("#connect").classList.add("complete");
    else {
      document.querySelector("#connect").classList.add("active");
      document.querySelector("#connect").focus();
    }

    if (file) document.querySelector("#upload").classList.add("complete");
    else if (calculator) {
      document.querySelector("#upload").classList.add("active");
      document.querySelector("#upload").focus();
    }

    if (calculator && file) {
      document.querySelector("#start").classList.add("active");
      document.querySelector("#start").focus();
    }
  }

  async function connect(calc) {
    if (await calc.isReady()) {
      calculator = calc;
      updateButtons();
    } else {
      alert("Sorry!", "The connected device does not seem to be responding.");
    }
  }

  function handleUnsupported(error) {
    if (error && error.message === "Calculator model not supported") {
      confirm("Sorry!", "It looks like your device is not yet supported. Would you like to submit it for consideration?")
        .then(() => sendSupportRequest(error.device))
        .catch(() => {});
    } else {
      console.error(error);
    }
  }

  function sendSupportRequest(device) {
    document.querySelector("#flow").innerHTML = `
      <h1>Device info to submit</h1>
      <p>Please <a href='https://github.com/Timendus/ticalc-usb/issues/new?assignees=&labels=device+support+request&template=calculator-support-request.md&title=Calculator+support+request' target="_blank">file a support request on Github</a> with the following information:</p>
      <pre>${JSON.stringify(device, null, 2)}</pre>
    `;
  }

  function selectFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "*/*"; // Accept all files, ignore types

    input.addEventListener("change", async (event) => {
      file = await readFile(event.target.files[0]);
      console.log(file);

      // Bypass file validation check
      /* Original check removed:
      if (!tifiles.isValid(file)) {
        file = null;
        alert("Sorry!", "The file you have selected does not seem to be a valid calculator file");
      }
      */

      updateButtons();
    });

    input.click();
  }

  function readFile(file) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.addEventListener("load", (event) => resolve(new Uint8Array(event.target.result)));
      reader.readAsArrayBuffer(file);
    });
  }

  async function sendFile() {
    if (!calculator || !file) return;

    // Bypass calculator compatibility check
    /* Original check removed:
    if (!calculator.canReceive(file)) {
      return alert("Sorry!", `The file you have selected does not appear to be a valid file for your ${calculator.name}.`);
    }
    */

    const details = await calculator.getStorageDetails(file);
    if (!details.fits) return alert("Sorry!", "Your calculator does not have enough free memory to receive this file.");

    try {
      await calculator.sendFile(file);
      document.querySelector("#start").classList.remove("active");
      document.querySelector("#start").classList.add("complete");
      alert("Success!", "The file has been sent!");
    } catch (e) {
      alert("Sorry!", "Something went wrong 😢");
      console.error(e);
    }
  }

  function alert(title, body) {
    return new Promise((resolve) => {
      const popup = setPopup(title, body);
      const button = popupButton("yes", "Okay", () => {
        popup.classList.remove("active");
        resolve();
      });
      popup.querySelector(".buttons").appendChild(button);
      popup.classList.add("active");
    });
  }

  function confirm(title, body) {
    return new Promise((resolve, reject) => {
      const popup = setPopup(title, body);
      const yesButton = popupButton("yes", "Okay", () => {
        popup.classList.remove("active");
        resolve();
      });
      const noButton = popupButton("no", "Cancel", () => {
        popup.classList.remove("active");
        reject();
      });
      popup.querySelector(".buttons").appendChild(yesButton);
      popup.querySelector(".buttons").appendChild(noButton);
      popup.classList.add("active");
    });
  }

  window.addEventListener("load", () => {
    if (ticalc.browserSupported()) {
      document.querySelector("#flow").classList.add("active");
      document.querySelector("#incompatible").classList.remove("active");

      ticalc.init({ supportLevel: "none" })
        .catch(e => handleUnsupported(e));

      ticalc.addEventListener("disconnect", (calc) => {
        if (calc !== calculator) return;
        calculator = null;
        updateButtons();
      });

      ticalc.addEventListener("connect", async (calc) => {
        if (calc.status === "experimental" || calc.status === "beta") {
          confirm("Be careful!", `Your device (${calc.name}) only has ${calc.status} support. Are you sure you want to continue?`)
            .then(() => connect(calc))
            .catch(() => {});
        } else {
          connect(calc);
        }
      });

      updateButtons();

      document.querySelector("#connect").addEventListener("click", () => 
        ticalc.choose().catch(e => handleUnsupported(e))
      );

      document.querySelector("#upload").addEventListener("click", () => selectFile());

      document.querySelector("#start").addEventListener("click", () => sendFile());
    } else {
      document.querySelector("#flow").classList.remove("active");
      document.querySelector("#incompatible").classList.add("active");
    }
  });

})();
