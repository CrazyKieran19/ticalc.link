(() => {
    const { ticalc: e, tifiles: t } = n(918);
    let r = null, s = null;

    function i() {
        document.querySelectorAll(".buttons button").forEach((e => e.classList.remove("active", "complete"))),
            r ? document.querySelector("#connect").classList.add("complete") : (document.querySelector("#connect").classList.add("active"), document.querySelector("#connect").focus()),
            s ? document.querySelector("#upload").classList.add("complete") : r && (document.querySelector("#upload").classList.add("active"), document.querySelector("#upload").focus()),
            r && s && (document.querySelector("#start").classList.add("active"), document.querySelector("#start").focus())
    }

    async function c(e) {
        await e.isReady() ? (r = e, i()) : d("Sorry!", "The connected device does not seem to be responding.")
    }

    function o(e) {
        e && "Calculator model not supported" == e.message ? l("Sorry!", "It looks like your device is not yet supported. Would you like to submit it for consideration?").then((() => function(e) {
            document.querySelector("#flow").innerHTML = `
                <h1>Device info to submit</h1>
                <p>Please <a href='https://github.com/Timendus/ticalc-usb/issues/new?assignees=&labels=device+support+request&template=calculator-support-request.md&title=Calculator+support+request' target="_blank">file a support request on Github</a> with the following information:</p>
                <pre>${JSON.stringify({ deviceClass: e.deviceClass, deviceProtocol: e.deviceProtocol, deviceSubclass: e.deviceSubclass, deviceVersionMajor: e.deviceVersionMajor, deviceVersionMinor: e.deviceVersionMinor, deviceVersionSubminor: e.deviceVersionSubminor, manufacturerName: e.manufacturerName, productId: e.productId, productName: e.productName, serialNumber: e.serialNumber, usbVersionMajor: e.usbVersionMajor, usbVersionMinor: e.usbVersionMinor, usbVersionSubminor: e.usbVersionSubminor, vendorId: e.vendorId }, null, 2)}</pre>
            `
        }(e.device))).catch((() => {})) : console.error(e)
    }

    function a(e, t) {
        const n = document.getElementById("popup");
        return n.querySelector("h2").innerText = e, n.querySelector("p").innerText = t, n.querySelector(".buttons").innerHTML = "", n
    }

    function u(e, t, n) {
        const r = document.createElement("button");
        return r.classList.add(e), r.innerText = t, r.onclick = n, r
    }

    function d(e, t) {
        return new Promise(((n, r) => {
            const s = a(e, t),
                i = u("yes", "Okay", (() => {
                    s.classList.remove("active"), n()
                }));
            s.querySelector(".buttons").appendChild(i), s.classList.add("active")
        }))
    }

    function l(e, t) {
        return new Promise(((n, r) => {
            const s = a(e, t),
                i = u("yes", "Okay", (() => {
                    s.classList.remove("active"), n()
                })),
                c = u("no", "Cancel", (() => {
                    s.classList.remove("active"), r()
                }));
            s.querySelector(".buttons").appendChild(i), s.querySelector(".buttons").appendChild(c), s.classList.add("active")
        }))
    }

    window.addEventListener("load", (() => {
        e.browserSupported() ? (function() {
            const t = e.models().filter((e => "supported" == e.status || "beta" == e.status)).map((e => "beta" == e.status ? e.name + " (beta)" : e.name)).join(", ");
            document.querySelector("#supported").innerText = t
        }(), e.addEventListener("disconnect", (e => {
            e == r && (r = null, i())
        })), e.addEventListener("connect", (async e => "experimental" == e.status || "beta" == e.status ? l("Be careful!", `Your device (${e.name}) only has ${e.status} support. Are you sure you want to continue?`).then((() => c(e))).catch((() => {})) : c(e))), i(), document.querySelector("#connect").addEventListener("click", (() => e.choose().catch((e => o(e))))), document.querySelector("#upload").addEventListener("click", (() => function() {
            const e = document.createElement("input");
            e.type = "file";
            e.accept = "*/*";
            e.addEventListener("change", (async e => {
                s = t.parseFile(await function(e) {
                    return new Promise(((t, n) => {
                        var r = new FileReader;
                        r.addEventListener("load", (e => t(new Uint8Array(e.target.result))));
                        r.readAsArrayBuffer(e);
                    }));
                }(e.target.files[0]));
                console.log(s);
                i(); // Update UI to show the blue buttons
            }));
            e.click();
        }())), document.querySelector("#start").addEventListener("click", (() => async function() {
            if (r && s) {
                try {
                    await r.sendFile(s);
                    document.querySelector("#start").classList.remove("active");
                    document.querySelector("#start").classList.add("complete");
                    d("Success!", "The file has been sent!");
                } catch (e) {
                    d("Sorry!", "Something went wrong 😢");
                    console.error(e);
                }
            }
        }())), e.init({ supportLevel: "none" }).catch((e => o(e))), document.querySelector("#flow").classList.add("active"), document.querySelector("#incompatible").classList.remove("active")) : (document.querySelector("#flow").classList.remove("active"), document.querySelector("#incompatible").classList.add("active"))
    }))
})();
