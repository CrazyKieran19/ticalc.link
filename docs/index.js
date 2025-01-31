// index.js

let selectedFile;
let device;

document.getElementById('fileInput').addEventListener('change', handleFileSelect, false);

async function handleFileSelect(event) {
  selectedFile = event.target.files[0];
  if (selectedFile) {
    console.log("Selected file:", selectedFile.name);
  }
}

async function uploadFile() {
  if (!selectedFile) {
    alert('Please select a file first.');
    return;
  }

  const buffer = await selectedFile.arrayBuffer();
  const packetCount = Math.ceil(buffer.byteLength / 128);  // Assuming 128-byte packet size
  console.log(`Packet count: ${packetCount}`);

  try {
    // Request the device
    device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x1d50, productId: 0x6081 }] });
    
    // Open and claim the device
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(0);

    // Send the file in packets
    for (let i = 0; i < packetCount; i++) {
      const packetData = new Uint8Array(128);  // A packet size of 128 bytes
      const start = i * 128;
      const end = Math.min((i + 1) * 128, buffer.byteLength);
      packetData.set(new Uint8Array(buffer.slice(start, end)));

      // Send the packet to the device
      await sendPacketToDevice(device, packetData);
    }

    console.log('Upload completed!');
    alert('File uploaded successfully!');
  } catch (error) {
    console.error('Error during upload:', error);
    alert('An error occurred during upload.');
  }
}

// Function to send packet data to the device
async function sendPacketToDevice(device, packetData) {
  try {
    await device.transferOut(1, packetData);
    console.log("Sent packet:", packetData);
  } catch (error) {
    console.error('Error sending packet:', error);
  }
}
