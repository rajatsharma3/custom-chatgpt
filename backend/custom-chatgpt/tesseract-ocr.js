import { createWorker } from "tesseract.js";

(async () => {
  const worker = await createWorker("eng");
  const ret = await worker.recognize(
    "https://replicate.delivery/pbxt/Jj87qg6dTft3R5kFIzda2vorF3epnzwJpv96PsKcgkdZipLV/figure-65.png"
  );
  console.log(ret.data.text);
  await worker.terminate();
})();
