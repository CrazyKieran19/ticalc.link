async sendFile(e) {
    // Iterate through the entries of the file object and send each part
    for (let t = 0; t < e.entries.length; t++) {
        await this._sendEntry(e.entries[t]);
    }
}

async _sendEntry(fileEntry) {
    // Send each entry's metadata
    await this._d.send({
        type: s.virtualPacketTypes.DUSB_VPKT_RTS,
        data: [
            ...i.intToBytes(fileEntry.name.length, 2),
            ...i.asciiToBytes(fileEntry.name, fileEntry.name.length),
            0, // File type or additional data, could be modified for generalization
            ...i.intToBytes(fileEntry.size, 4),
            s.transferModes.SILENT, // Silent transfer mode (non-interrupting)
            ...this._entryParameters(fileEntry)
        ]
    });
    
    await this._d.expect(s.virtualPacketTypes.DUSB_VPKT_DATA_ACK);
    
    // Send the actual file data in chunks
    await this._d.send({
        type: s.virtualPacketTypes.DUSB_VPKT_VAR_CNTS,
        data: fileEntry.data
    });

    await this._d.expect(s.virtualPacketTypes.DUSB_VPKT_DATA_ACK);

    // End of transfer signal
    await this._d.send({
        type: s.virtualPacketTypes.DUSB_VPKT_EOT
    });
}
