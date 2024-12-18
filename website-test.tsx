/** @jsxImportSource https://esm.sh/react@18.2.0  */
import Cerebras from "https://esm.sh/@cerebras/cerebras_cloud_sdk";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import { Prism as SyntaxHighlighter } from "https://esm.sh/react-syntax-highlighter";
import React, { useEffect, useState } from "https://esm.sh/react@18.2.0";
import { STARTER_PROMPTS } from "./cerebras_coder_prompts";

// random 3 prompts from STARTER_PROMPTS
const prompts = STARTER_PROMPTS.sort(() => Math.random() - 0.5).slice(0, 4);

type PromptItem = typeof prompts[number];

const PoweredBy = ({ className }: { className?: string }) => (
  <a
    href="https://inference.cerebras.ai/"
    target="_blank"
    className={"p-[1px] text-gray-400 bg-[linear-gradient(90deg,_#0EAEE9_0%,_#22C55E_29%,_#D948EF_59%,_#8B5CF6_100%)] hover:bg-[linear-gradient(180deg,_#0EAEE9_0%,_#22C55E_29%,_#D948EF_59%,_#8B5CF6_100%)] transition-all w-fit mx-auto rounded-full hover:text-gray-200"
      + " " + className}
  >
    <div className="text-xs font-dm-mono rounded-full bg-[var(--dark)] px-4 py-2">
      Powered by Llama3.3-70B on Cerebras
    </div>
  </a>
);

function Hero({
  prompt,
  setPrompt,
  handleSubmit,
  handleStarterPromptClick,
}: {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: React.FormEvent) => void;
  handleStarterPromptClick: (promptItem: PromptItem) => void;
}) {
  const inIframe = window.self !== window.top;
  return (
    <section className="h-full max-w-screen-xl mx-auto px-4 lg:px-8 flex flex-col justify-center">
      <PoweredBy className={"lg:hidden mb-8"} />
      <h1 className="text-[38px] lg:text-6xl text-center font-dm-sans">
        Dream it. Code it. <br />
        <em>Instantly.</em>
      </h1>

      <p className="text-[#bababa] text-center max-w-[25ch] mx-auto my-4 font-dm-sans">
        Turn your ideas into fully functional apps in{" "}
        <span className="relative w-fit text-fuchsia-400 z-10 italic font-semibold rounded-full">
          less than a second
        </span>
      </p>

      <form onSubmit={handleSubmit} className="mt-4 relative w-full max-w-lg mx-auto">
        <input
          type="text"
          autoFocus={!inIframe}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Build me a calculator app..."
          className="w-full h-[52px] rounded-full bg-black border border-[#353535] py-6 px-8 placeholder:bg-clip-text placeholder:text-transparent placeholder:opacity-50 placeholder:bg-[linear-gradient(90.138deg,_#FFFFFF_0%,_rgba(255,_255,_255,_36%)_100%)] focus:focus:outline focus:outline-offset-2 focus:outline-[var(--deepblue)] text-2xl placeholder:text-2xl"
        />
        <button
          type="submit"
          className="absolute right-[7px] top-1/2 -translate-y-1/2 bg-white size-10 text-black font-medium flex items-center gap-1 justify-center shadow-button rounded-full hover:cursor-pointer hover:bg-opacity-90"
        >
          <svg
            width="16"
            height="17"
            viewBox="0 0 16 17"
            fill="none"
            className="translate-x-[1px] -translate-y-[1px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-0.000976562 14.777L7.185 7.591L9.40601 9.81299L2.22101 16.998L-0.000976562 14.777Z"
              fill="black"
            />
            <path
              d="M10.733 4.04501L7.896 6.88199L10.118 9.104L12.955 6.267L10.733 4.04501Z"
              fill="black"
            />
            <path
              opacity="0.8"
              d="M5 6L6.06097 4.061L8 3L6.06097 1.939L5 0L3.93903 1.939L2 3L3.93903 4.061L5 6Z"
              fill="black"
            />
            <path
              opacity="0.2"
              d="M14.5 4L15.03 3.03L16 2.5L15.03 1.97L14.5 1L13.97 1.97L13 2.5L13.97 3.03L14.5 4Z"
              fill="black"
            />
            <path
              opacity="0.7"
              d="M14 9L13.293 10.293L12 11L13.293 11.707L14 13L14.707 11.707L16 11L14.707 10.293L14 9Z"
              fill="black"
            />
          </svg>

          <span className="sr-only">Prompt</span>
        </button>
      </form>

      <div className="w-full max-w-lg mx-auto mt-4 flex  justify-center gap-2 items-center flex-wrap lg:flex-nowrap">
        {prompts.map(promptItem => (
          <button
            key={promptItem.title}
            onClick={() => handleStarterPromptClick(promptItem)}
            className="text-xs rounded-full border border-[#353535] text-[#aaa] p-1 px-2  whitespace-nowrap hover:cursor-pointer hover:bg-gray-900 hover:translate-y-[-1px] hover:text-white transition-all"
          >
            {promptItem.title}
          </button>
        ))}
      </div>
    </section>
  );
}

function App() {
  const previewRef = React.useRef<HTMLDivElement>(null);
  const [prompt, setPrompt] = useState("");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [projectVersion, setProjectVersion] = useState<number | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const [iframeKey, setIframeKey] = useState(0);
  const inIframe = window.self !== window.top;

  const [code, setCode] = useState("");
  const [viewingCode, setViewingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [performance, setPerformance] = useState<
    {
      tokensPerSecond: number;
      totalTokens: number;
      time: number;
    }
  >({
    tokensPerSecond: 0,
    totalTokens: 0,
    time: 0,
  });

  const handleClipboard = async (str: string) => {
    await navigator.clipboard.writeText(str);
    Toastify({
      text: "Copied to clipboard!",
      position: "center",
      duration: 3000,
      style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",
        borderRadius: "20px",
      },
    }).showToast();
  };

  const handleRefresh = () => {
    setIframeKey(prevKey => prevKey + 1);
  };

  const [versionHistory, setVersionHistory] = useState<{
    currentVersionIndex: number;
    versions: {
      code: string;
      prompt: string;
      timestamp: number;
    }[];
  }>({
    currentVersionIndex: 0,
    versions: [],
  });

  function handleStarterPromptClick(promptItem: typeof prompts[number]) {
    setLoading(true);
    setTimeout(() => handleSubmit(promptItem.prompt), 0);
  }

  async function handleSubmit(e: React.FormEvent | string) {
    if (typeof e !== "string") {
      e.preventDefault();
    }
    setLoading(true);

    try {
      const response = await fetch("/", {
        method: "POST",
        body: JSON.stringify({
          prompt: typeof e === "string" ? e : prompt,
          currentCode: code,
          projectId,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error("Generation Error: " + await response.text());
      }

      const result = await response.json();

      setProjectId(result.projectId);
      setProjectVersion(result.versionNumber);
      setCode(result.code);
      setPerformance(result.performance);
      setVersionHistory({
        currentVersionIndex: versionHistory.versions.length,
        versions: [...versionHistory.versions, {
          code: result.code,
          prompt,
          timestamp: Date.now(),
        }],
      });
      setPrompt("");
    } catch (error) {
      Toastify({
        text: "We may have hit our Cerebras Usage limits. Try again later or fork this and use your own API key.",
        position: "center",
        duration: 3000,
        style: {
          background: "linear-gradient(to right, #ff5f6d, #ffc371)",
          borderRadius: "20px",
        },
      }).showToast();
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleVersionChange(direction: "back" | "forward") {
    const { currentVersionIndex, versions } = versionHistory;
    if (direction === "back" && currentVersionIndex > 0) {
      const newIndex = currentVersionIndex - 1;
      setCode(versions[newIndex].code);
      setVersionHistory(prev => ({
        ...prev,
        currentVersionIndex: newIndex,
      }));
    } else if (direction === "forward" && currentVersionIndex < versions.length - 1) {
      const newIndex = currentVersionIndex + 1;
      setCode(versions[newIndex].code);
      setVersionHistory(prev => ({
        ...prev,
        currentVersionIndex: newIndex,
      }));
    }
  }

  const projectURL = `${window.location.origin}/p/${projectId}`;
  const versionURL = `${window.location.origin}/p/${projectId}/v/${projectVersion}`;

  return (
    <div className="h-svh flex flex-col justify-between">
      <header className="relative font-mono px-4 py-6 lg:px-8 flex justify-between items-center w-full max-w-screen-xl mx-auto">
        <a href="/">
          <svg
            width="111"
            height="31"
            viewBox="0 0 111 31"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M87.7518 31C87.1669 31 86.6684 30.8361 86.2563 30.5082C85.8508 30.1803 85.5384 29.7213 85.3191 29.1311C85.1064 28.5337 85 27.8415 85 27.0546C85 26.2605 85.1064 25.5683 85.3191 24.9781C85.5384 24.3807 85.8541 23.918 86.2662 23.5902C86.6783 23.255 87.1735 23.0874 87.7518 23.0874C88.5029 23.0874 89.1011 23.3133 89.5465 23.765C89.9918 24.2095 90.251 24.8142 90.3242 25.5792H89.1576C89.0978 25.1785 88.9483 24.847 88.709 24.5847C88.4763 24.3151 88.154 24.1803 87.7418 24.1803C87.2167 24.1803 86.808 24.4353 86.5155 24.9454C86.223 25.4554 86.0768 26.1585 86.0768 27.0546C86.0768 27.9435 86.223 28.643 86.5155 29.153C86.808 29.6557 87.2167 29.9071 87.7418 29.9071C88.1672 29.9071 88.4929 29.7869 88.7189 29.5464C88.9449 29.2987 89.0912 28.9745 89.1576 28.5738H90.3242C90.2178 29.3242 89.9486 29.918 89.5166 30.3552C89.0845 30.7851 88.4963 31 87.7518 31Z"
              fill="#A8A7AF"
            />
            <path
              d="M92.7131 31C92.2412 31 91.8191 30.8834 91.4469 30.6503C91.0747 30.4171 90.7822 30.0893 90.5695 29.6667C90.3568 29.2368 90.2505 28.7341 90.2505 28.1585C90.2505 27.5829 90.3568 27.0838 90.5695 26.6612C90.7822 26.2313 91.0747 25.8998 91.4469 25.6667C91.8191 25.4335 92.2445 25.3169 92.7231 25.3169C93.2017 25.3169 93.6238 25.4335 93.9894 25.6667C94.3616 25.8998 94.6507 26.2313 94.8568 26.6612C95.0695 27.0838 95.1758 27.5829 95.1758 28.1585C95.1758 28.7341 95.0695 29.2368 94.8568 29.6667C94.6441 30.0893 94.3516 30.4171 93.9794 30.6503C93.6138 30.8834 93.1917 31 92.7131 31ZM92.7131 29.8962C92.9657 29.8962 93.1984 29.8342 93.4111 29.7104C93.6238 29.5865 93.7933 29.3971 93.9196 29.1421C94.0525 28.8798 94.119 28.5519 94.119 28.1585C94.119 27.7577 94.0525 27.4299 93.9196 27.1749C93.7933 26.9199 93.6238 26.7304 93.4111 26.6066C93.205 26.4827 92.9757 26.4208 92.7231 26.4208C92.4705 26.4208 92.2379 26.4827 92.0252 26.6066C91.8125 26.7304 91.6397 26.9199 91.5067 27.1749C91.3804 27.4299 91.3173 27.7577 91.3173 28.1585C91.3173 28.7559 91.4536 29.1967 91.7261 29.4809C92.0053 29.7577 92.3343 29.8962 92.7131 29.8962Z"
              fill="#A8A7AF"
            />
            <path
              d="M97.4252 31C97.0131 31 96.6442 30.8944 96.3185 30.6831C95.9928 30.4645 95.7336 30.1439 95.5408 29.7213C95.3547 29.2987 95.2617 28.7778 95.2617 28.1585C95.2617 27.5392 95.358 27.0182 95.5508 26.5956C95.7436 26.173 96.0028 25.8561 96.3285 25.6448C96.6608 25.4262 97.0297 25.3169 97.4352 25.3169C97.8141 25.3169 98.1265 25.3971 98.3724 25.5574C98.6183 25.7104 98.8011 25.9071 98.9208 26.1475V23H99.9776V30.8689H99.0703L98.9806 30.071H98.9208C98.7878 30.3552 98.5984 30.5811 98.3525 30.7486C98.1132 30.9162 97.8041 31 97.4252 31ZM97.6446 29.8962C98.0234 29.8962 98.3358 29.7505 98.5818 29.459C98.8344 29.1676 98.9607 28.7341 98.9607 28.1585C98.9607 27.5756 98.8344 27.1421 98.5818 26.8579C98.3358 26.5665 98.0234 26.4208 97.6446 26.4208C97.2657 26.4208 96.95 26.5665 96.6974 26.8579C96.4515 27.1494 96.3285 27.5865 96.3285 28.1694C96.3285 28.745 96.4515 29.1785 96.6974 29.4699C96.95 29.7541 97.2657 29.8962 97.6446 29.8962Z"
              fill="#A8A7AF"
            />
            <path
              d="M102.736 31C102.257 31 101.835 30.8834 101.469 30.6503C101.104 30.4098 100.818 30.0783 100.612 29.6557C100.406 29.2332 100.303 28.7413 100.303 28.1803C100.303 27.612 100.402 27.1129 100.602 26.6831C100.808 26.2532 101.094 25.918 101.459 25.6776C101.832 25.4372 102.26 25.3169 102.745 25.3169C103.224 25.3169 103.636 25.4372 103.982 25.6776C104.327 25.9107 104.593 26.224 104.779 26.6175C104.972 27.0109 105.069 27.4444 105.069 27.918C105.069 27.9909 105.069 28.071 105.069 28.1585C105.069 28.2386 105.065 28.3297 105.059 28.4317H101.34C101.373 28.9344 101.522 29.3169 101.788 29.5792C102.054 29.8342 102.367 29.9617 102.726 29.9617C103.038 29.9617 103.284 29.8925 103.463 29.7541C103.649 29.6084 103.786 29.4117 103.872 29.1639H104.939C104.819 29.6812 104.57 30.1184 104.191 30.4754C103.812 30.8251 103.327 31 102.736 31ZM102.736 26.3224C102.41 26.3224 102.121 26.4317 101.868 26.6503C101.616 26.8616 101.453 27.1603 101.38 27.5464H104.012C103.985 27.1821 103.856 26.8871 103.623 26.6612C103.39 26.4353 103.094 26.3224 102.736 26.3224Z"
              fill="#A8A7AF"
            />
            <path
              d="M105.434 30.8689V29.8634H106.64V26.8142C106.64 26.5738 106.534 26.4536 106.321 26.4536H105.533V25.4481H106.72C106.992 25.4481 107.215 25.5355 107.388 25.7104C107.561 25.878 107.647 26.1148 107.647 26.4208V26.5519H107.697C107.77 26.1439 107.926 25.8379 108.165 25.6339C108.411 25.4226 108.767 25.3169 109.232 25.3169H110V26.541H108.923C108.531 26.541 108.229 26.6903 108.016 26.9891C107.803 27.2878 107.697 27.6448 107.697 28.0601V29.8634H109.232V30.8689H105.434Z"
              fill="#A8A7AF"
            />
            <path
              d="M28.04 20.24C26.8667 20.24 25.8667 19.94 25.04 19.34C24.2267 18.74 23.6 17.9 23.16 16.82C22.7333 15.7267 22.52 14.46 22.52 13.02C22.52 11.5667 22.7333 10.3 23.16 9.22C23.6 8.12667 24.2333 7.28 25.06 6.68C25.8867 6.06667 26.88 5.76 28.04 5.76C29.5467 5.76 30.7467 6.17333 31.64 7C32.5333 7.81333 33.0533 8.92 33.2 10.32H30.86C30.74 9.58667 30.44 8.98 29.96 8.5C29.4933 8.00667 28.8467 7.76 28.02 7.76C26.9667 7.76 26.1467 8.22667 25.56 9.16C24.9733 10.0933 24.68 11.38 24.68 13.02C24.68 14.6467 24.9733 15.9267 25.56 16.86C26.1467 17.78 26.9667 18.24 28.02 18.24C28.8733 18.24 29.5267 18.02 29.98 17.58C30.4333 17.1267 30.7267 16.5333 30.86 15.8H33.2C32.9867 17.1733 32.4467 18.26 31.58 19.06C30.7133 19.8467 29.5333 20.24 28.04 20.24ZM39.1122 20.24C38.1522 20.24 37.3055 20.0267 36.5722 19.6C35.8389 19.16 35.2655 18.5533 34.8522 17.78C34.4389 17.0067 34.2322 16.1067 34.2322 15.08C34.2322 14.04 34.4322 13.1267 34.8322 12.34C35.2455 11.5533 35.8189 10.94 36.5522 10.5C37.2989 10.06 38.1589 9.84 39.1322 9.84C40.0922 9.84 40.9189 10.06 41.6122 10.5C42.3055 10.9267 42.8389 11.5 43.2122 12.22C43.5989 12.94 43.7922 13.7333 43.7922 14.6C43.7922 14.7333 43.7922 14.88 43.7922 15.04C43.7922 15.1867 43.7855 15.3533 43.7722 15.54H36.3122C36.3789 16.46 36.6789 17.16 37.2122 17.64C37.7455 18.1067 38.3722 18.34 39.0922 18.34C39.7189 18.34 40.2122 18.2133 40.5722 17.96C40.9455 17.6933 41.2189 17.3333 41.3922 16.88H43.5322C43.2922 17.8267 42.7922 18.6267 42.0322 19.28C41.2722 19.92 40.2989 20.24 39.1122 20.24ZM39.1122 11.68C38.4589 11.68 37.8789 11.88 37.3722 12.28C36.8655 12.6667 36.5389 13.2133 36.3922 13.92H41.6722C41.6189 13.2533 41.3589 12.7133 40.8922 12.3C40.4255 11.8867 39.8322 11.68 39.1122 11.68ZM45.5244 20V18.16H47.9444V12.58C47.9444 12.14 47.731 11.92 47.3044 11.92H45.7244V10.08H48.1044C48.651 10.08 49.0977 10.24 49.4444 10.56C49.791 10.8667 49.9644 11.3 49.9644 11.86V12.1H50.0644C50.211 11.3533 50.5244 10.7933 51.0044 10.42C51.4977 10.0333 52.211 9.84 53.1444 9.84H54.6844V12.08H52.5244C51.7377 12.08 51.131 12.3533 50.7044 12.9C50.2777 13.4467 50.0644 14.1 50.0644 14.86V18.16H53.1444V20H45.5244ZM61.0966 20.24C60.1366 20.24 59.2899 20.0267 58.5566 19.6C57.8232 19.16 57.2499 18.5533 56.8366 17.78C56.4232 17.0067 56.2166 16.1067 56.2166 15.08C56.2166 14.04 56.4166 13.1267 56.8166 12.34C57.2299 11.5533 57.8032 10.94 58.5366 10.5C59.2832 10.06 60.1432 9.84 61.1166 9.84C62.0766 9.84 62.9032 10.06 63.5966 10.5C64.2899 10.9267 64.8232 11.5 65.1966 12.22C65.5832 12.94 65.7766 13.7333 65.7766 14.6C65.7766 14.7333 65.7766 14.88 65.7766 15.04C65.7766 15.1867 65.7699 15.3533 65.7566 15.54H58.2966C58.3632 16.46 58.6632 17.16 59.1966 17.64C59.7299 18.1067 60.3566 18.34 61.0766 18.34C61.7032 18.34 62.1966 18.2133 62.5566 17.96C62.9299 17.6933 63.2032 17.3333 63.3766 16.88H65.5166C65.2766 17.8267 64.7766 18.6267 64.0166 19.28C63.2566 19.92 62.2832 20.24 61.0966 20.24ZM61.0966 11.68C60.4432 11.68 59.8632 11.88 59.3566 12.28C58.8499 12.6667 58.5232 13.2133 58.3766 13.92H63.6566C63.6032 13.2533 63.3432 12.7133 62.8766 12.3C62.4099 11.8867 61.8166 11.68 61.0966 11.68ZM72.5088 20.24C71.7754 20.24 71.1554 20.0933 70.6488 19.8C70.1554 19.4933 69.7754 19.0733 69.5088 18.54H69.3888L69.2088 20H67.3888V5.6H69.5088V11.36C69.7488 10.96 70.1288 10.6067 70.6488 10.3C71.1688 9.99333 71.7888 9.84 72.5088 9.84C73.3354 9.84 74.0754 10.04 74.7288 10.44C75.3821 10.8267 75.8954 11.4067 76.2688 12.18C76.6554 12.9533 76.8488 13.9067 76.8488 15.04C76.8488 16.1733 76.6554 17.1267 76.2688 17.9C75.8954 18.6733 75.3821 19.26 74.7288 19.66C74.0754 20.0467 73.3354 20.24 72.5088 20.24ZM72.0688 18.22C72.8288 18.22 73.4554 17.96 73.9488 17.44C74.4554 16.9067 74.7088 16.1133 74.7088 15.06C74.7088 13.9933 74.4554 13.1933 73.9488 12.66C73.4554 12.1267 72.8288 11.86 72.0688 11.86C71.3088 11.86 70.6754 12.1267 70.1688 12.66C69.6754 13.18 69.4288 13.9733 69.4288 15.04C69.4288 16.0933 69.6754 16.8867 70.1688 17.42C70.6754 17.9533 71.3088 18.22 72.0688 18.22ZM78.5009 20V18.16H80.9209V12.58C80.9209 12.14 80.7076 11.92 80.2809 11.92H78.7009V10.08H81.0809C81.6276 10.08 82.0743 10.24 82.4209 10.56C82.7676 10.8667 82.9409 11.3 82.9409 11.86V12.1H83.0409C83.1876 11.3533 83.5009 10.7933 83.9809 10.42C84.4743 10.0333 85.1876 9.84 86.1209 9.84H87.6609V12.08H85.5009C84.7143 12.08 84.1076 12.3533 83.6809 12.9C83.2543 13.4467 83.0409 14.1 83.0409 14.86V18.16H86.1209V20H78.5009ZM93.0531 20.24C92.2665 20.24 91.6065 20.1067 91.0731 19.84C90.5398 19.56 90.1398 19.1933 89.8731 18.74C89.6065 18.2733 89.4731 17.7667 89.4731 17.22C89.4731 16.2467 89.8265 15.4867 90.5331 14.94C91.2531 14.3933 92.2665 14.12 93.5731 14.12H96.1331V13.9C96.1331 12.4067 95.4398 11.66 94.0531 11.66C93.4798 11.66 92.9931 11.7867 92.5931 12.04C92.2065 12.28 91.9465 12.6733 91.8131 13.22H89.6931C89.7998 12.18 90.2465 11.36 91.0331 10.76C91.8331 10.1467 92.8398 9.84 94.0531 9.84C95.5198 9.84 96.5865 10.2 97.2531 10.92C97.9198 11.64 98.2531 12.6333 98.2531 13.9V20H96.4531L96.2731 18.54H96.1331C95.8398 19.0067 95.4731 19.4067 95.0331 19.74C94.5931 20.0733 93.9331 20.24 93.0531 20.24ZM93.4531 18.46C94.3198 18.46 94.9665 18.2 95.3931 17.68C95.8331 17.1467 96.0731 16.4733 96.1131 15.66H93.7931C93.0331 15.66 92.4931 15.7867 92.1731 16.04C91.8665 16.28 91.7131 16.62 91.7131 17.06C91.7131 17.5 91.8665 17.8467 92.1731 18.1C92.4931 18.34 92.9198 18.46 93.4531 18.46ZM105.025 20.24C103.719 20.24 102.679 19.9333 101.905 19.32C101.132 18.7067 100.692 17.8933 100.585 16.88H102.765C102.845 17.3467 103.079 17.7267 103.465 18.02C103.865 18.3133 104.392 18.46 105.045 18.46C105.672 18.46 106.152 18.3333 106.485 18.08C106.832 17.8133 107.005 17.5067 107.005 17.16C107.005 16.6533 106.799 16.3067 106.385 16.12C105.985 15.9333 105.392 15.7933 104.605 15.7C103.925 15.62 103.305 15.4667 102.745 15.24C102.199 15 101.765 14.68 101.445 14.28C101.125 13.8667 100.965 13.3533 100.965 12.74C100.965 11.8733 101.305 11.1733 101.985 10.64C102.665 10.1067 103.612 9.84 104.825 9.84C106.039 9.84 106.979 10.1133 107.645 10.66C108.312 11.2067 108.699 11.9533 108.805 12.9H106.765C106.712 12.5 106.505 12.1867 106.145 11.96C105.785 11.72 105.339 11.6 104.805 11.6C104.259 11.6 103.825 11.7067 103.505 11.92C103.185 12.12 103.025 12.3867 103.025 12.72C103.025 13.44 103.799 13.88 105.345 14.04C106.079 14.12 106.732 14.26 107.305 14.46C107.879 14.6467 108.332 14.9467 108.665 15.36C108.999 15.76 109.165 16.3267 109.165 17.06C109.179 17.66 109.005 18.2 108.645 18.68C108.299 19.16 107.812 19.54 107.185 19.82C106.572 20.1 105.852 20.24 105.025 20.24Z"
              fill="white"
            />
            <path
              d="M16 13C16 14.5823 15.5308 16.129 14.6518 17.4446C13.7727 18.7602 12.5233 19.7855 11.0615 20.391C9.59966 20.9965 7.99113 21.155 6.43928 20.8463C4.88743 20.5376 3.46197 19.7757 2.34315 18.6569C1.22433 17.538 0.4624 16.1126 0.153718 14.5607C-0.154964 13.0089 0.00346269 11.4003 0.608964 9.93853C1.21446 8.47672 2.23985 7.22729 3.55544 6.34824C4.87103 5.46919 6.41775 5 8 5V13H16Z"
              fill="#575757"
            />
            <path
              d="M7.99962 19.4657C6.72082 19.4657 5.47074 19.0865 4.40746 18.3761C3.34418 17.6656 2.51545 16.6558 2.02607 15.4743C1.5367 14.2929 1.40866 12.9928 1.65814 11.7386C1.90762 10.4844 2.52342 9.33231 3.42767 8.42807C4.33191 7.52382 5.48399 6.90802 6.73822 6.65854C7.99244 6.40906 9.29248 6.5371 10.4739 7.02647C11.6554 7.51585 12.6652 8.34458 13.3757 9.40786C14.0861 10.4711 14.4653 11.7212 14.4653 13L7.99962 13L7.99962 19.4657Z"
              fill="white"
            />
            <path
              d="M4 13C4 12.2089 4.2346 11.4355 4.67412 10.7777C5.11365 10.1199 5.73836 9.60723 6.46927 9.30448C7.20017 9.00173 8.00444 8.92252 8.78036 9.07686C9.55629 9.2312 10.269 9.61216 10.8284 10.1716C11.3878 10.731 11.7688 11.4437 11.9231 12.2196C12.0775 12.9956 11.9983 13.7998 11.6955 14.5307C11.3928 15.2616 10.8801 15.8864 10.2223 16.3259C9.56448 16.7654 8.79112 17 8 17L8 13L4 13Z"
              fill="#0C0F16"
            />
          </svg>

          <span className="sr-only">Cerebras Coder</span>
        </a>

        <PoweredBy className={"hidden lg:block"} />

        <a
          href={valURL}
          target="_blank"
          className="bg-white text-black font-medium flex items-center gap-1 shadow-button px-4 py-2 rounded-full hover:cursor-pointer hover:bg-opacity-90 items-center"
        >
          <svg
            viewBox="0 0 12 12"
            fill="none"
            className="size-4"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.56276 1.43755C9.27097 1.14593 8.91682 1.00008 8.50009 1.00008C8.08356 1.00008 7.72938 1.14585 7.43768 1.43755C7.14609 1.72917 7.00029 2.08329 7.00029 2.50005C7.00029 2.77087 7.0678 3.02219 7.20322 3.25393C7.33862 3.48571 7.52076 3.66675 7.7501 3.79689C7.7501 4.06772 7.72807 4.30609 7.68388 4.51178C7.63949 4.71748 7.56665 4.89839 7.46513 5.05474C7.36333 5.21102 7.25809 5.34374 7.14863 5.45317C7.03915 5.5626 6.8855 5.66538 6.6876 5.76178C6.48973 5.85813 6.306 5.93877 6.13678 6.00398C5.96756 6.06897 5.73962 6.14578 5.45317 6.23436C4.93227 6.39589 4.5313 6.54421 4.25002 6.67971V2.79679C4.4792 2.66667 4.6615 2.48566 4.7969 2.25388C4.93227 2.02211 4.99997 1.77077 4.99997 1.49994C4.99997 1.08332 4.8542 0.729119 4.56249 0.437499C4.2709 0.145906 3.91678 0 3.50005 0C3.08329 0 2.72917 0.145797 2.43747 0.437499C2.14588 0.729119 2 1.08332 2 1.49994C2 1.77077 2.0677 2.02211 2.20307 2.25388C2.33847 2.48566 2.52074 2.66667 2.74994 2.79679V9.20321C2.52074 9.33328 2.33847 9.51448 2.20307 9.74617C2.0677 9.97803 2 10.2294 2 10.5001C2 10.9167 2.14577 11.2709 2.43747 11.5625C2.72917 11.8541 3.08338 12 3.50005 12C3.9167 12 4.2709 11.8541 4.56249 11.5625C4.85411 11.2709 4.99997 10.9167 4.99997 10.5001C4.99997 10.2294 4.93227 9.97803 4.7969 9.74617C4.66147 9.51448 4.4792 9.33328 4.25002 9.20321V9.00009C4.25002 8.64077 4.35808 8.38043 4.57421 8.219C4.79033 8.05736 5.23174 7.87252 5.8985 7.66425C6.60173 7.44025 7.13046 7.22919 7.48461 7.03121C8.65123 6.3699 9.2398 5.29172 9.25018 3.79687C9.47952 3.66675 9.66165 3.48568 9.79705 3.25391C9.93236 3.02213 10.0002 2.77085 10.0002 2.50002C10.0003 2.08337 9.85438 1.72925 9.56276 1.43755ZM4.03141 11.0316C3.8855 11.1774 3.70843 11.2503 3.50016 11.2503C3.29175 11.2503 3.11468 11.1774 2.96883 11.0316C2.82306 10.8858 2.75008 10.7087 2.75008 10.5004C2.75008 10.292 2.82298 10.115 2.96883 9.96906C3.11468 9.82326 3.29175 9.75031 3.50016 9.75031C3.70843 9.75031 3.88553 9.82334 4.03141 9.96906C4.17726 10.115 4.25013 10.292 4.25013 10.5004C4.2501 10.7087 4.17726 10.8858 4.03141 11.0316ZM4.03141 2.0313C3.8855 2.17715 3.70843 2.25005 3.50016 2.25005C3.29175 2.25005 3.11468 2.17715 2.96883 2.0313C2.82306 1.88545 2.75008 1.70846 2.75008 1.50005C2.75008 1.2917 2.82298 1.11457 2.96883 0.968857C3.11468 0.823033 3.29175 0.750108 3.50016 0.750108C3.70843 0.750108 3.88553 0.823061 4.03141 0.968857C4.17726 1.11457 4.25013 1.2917 4.25013 1.50005C4.2501 1.70846 4.17726 1.88553 4.03141 2.0313ZM9.03143 3.03138C8.88563 3.17715 8.70864 3.2501 8.50029 3.2501C8.29183 3.2501 8.11472 3.17715 7.96904 3.03138C7.82324 2.88561 7.75029 2.70851 7.75029 2.50013C7.75029 2.29178 7.82324 2.11476 7.96904 1.96888C8.11483 1.823 8.29183 1.75016 8.50029 1.75016C8.70864 1.75016 8.88563 1.82303 9.03143 1.96888C9.17722 2.11462 9.25018 2.29175 9.25018 2.50013C9.25018 2.70848 9.17733 2.88561 9.03143 3.03138Z"
              fill="black"
            />
          </svg>
          Fork on{" "}
          <span className="">
            <ValTownSVG color="black" />
          </span>
        </a>
      </header>

      {shareModalOpen && (
        <div className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="rounded-xl bg-[var(--dark)] shadow-lg p-8 max-w-lg">
            <div className="flex justify-between items-center  mb-8">
              <h2 className="text-3xl font-bold">Share your project</h2>
              <button
                className="text-white font-bold rounded-xl hover:text-gray-400"
                onClick={() => setShareModalOpen(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex  flex-col mb-4 space-y-4">
              <div className="flex flex-col border-2 border-gray-500 rounded-xl p-4">
                <h2 className="text-xl font-bold">Latest Version</h2>
                <p className="text-[#a5a5a5] mb-2">
                  This is a live link to your project. It will change if you make more edits.
                </p>
                <div
                  className="flex items-center cursor-pointer rounded-xl font-mono justify-between bg-gray-900 hover:bg-gray-800 transition-all"
                  onMouseDown={() => handleClipboard(projectURL)}
                >
                  <span className="text-blue-500 hover:text-blue-400 py-2 px-4 max-w-80 lg:max-w-full truncate">
                    {projectURL}
                  </span>
                  <div className="py-2 px-4">
                    <CopyIcon />
                  </div>
                </div>
              </div>
              <div className="flex flex-col  border-2 border-gray-500 rounded-xl p-4">
                <h2 className="text-xl font-bold">
                  Pinned version (<code className="font-mono">#{projectVersion}</code>)
                </h2>
                <p className="text-[#a5a5a5] mb-2">
                  This is a permalink to v{projectVersion}. It won't change if you make more edits.
                </p>
                <div
                  className="flex items-center cursor-pointer rounded-xl font-mono justify-between bg-gray-900 hover:bg-gray-800 transition-all"
                  onMouseDown={() => handleClipboard(versionURL)}
                >
                  <span className="text-blue-500 hover:text-blue-400 py-2 px-4 max-w-80 lg:max-w-full truncate">
                    {versionURL}
                  </span>
                  <div className="py-2 px-4">
                    <CopyIcon />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {code
        ? undefined
        : (
          <div className={loading ? "animate-pulse" : ""}>
            <Hero
              prompt={prompt}
              setPrompt={setPrompt}
              handleSubmit={handleSubmit}
              handleStarterPromptClick={handleStarterPromptClick}
            />
          </div>
        )}

      {code && (
        <section
          className={"flex flex-col px-4 lg:px-8 max-w-screen-xl w-full mx-auto grow"
            + (loading ? " animate-pulse" : "")}
        >
          <form className="relative w-full mx-auto py-4" onSubmit={handleSubmit}>
            <input
              autoFocus={!inIframe}
              type="text"
              placeholder="Make changes to your app..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full h-[52px] rounded-full bg-black border-2 border-[#e2e2e2] py-6 px-8 focus:focus:outline focus:outline-[var(--deepblue)] text-2xl placeholder:text-2xl"
            />
            <button className="absolute right-[7px] top-1/2 -translate-y-1/2 bg-white size-10 text-black font-medium flex items-center gap-1 justify-center shadow-button rounded-full">
              <svg
                width="16"
                height="17"
                viewBox="0 0 16 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M-0.000976562 14.777L7.185 7.591L9.40601 9.81299L2.22101 16.998L-0.000976562 14.777Z"
                  fill="black"
                />
                <path
                  d="M10.733 4.04501L7.896 6.88199L10.118 9.104L12.955 6.267L10.733 4.04501Z"
                  fill="black"
                />
                <path
                  opacity="0.8"
                  d="M5 6L6.06097 4.061L8 3L6.06097 1.939L5 0L3.93903 1.939L2 3L3.93903 4.061L5 6Z"
                  fill="black"
                />
                <path
                  opacity="0.2"
                  d="M14.5 4L15.03 3.03L16 2.5L15.03 1.97L14.5 1L13.97 1.97L13 2.5L13.97 3.03L14.5 4Z"
                  fill="black"
                />
                <path
                  opacity="0.7"
                  d="M14 9L13.293 10.293L12 11L13.293 11.707L14 13L14.707 11.707L16 11L14.707 10.293L14 9Z"
                  fill="black"
                />
              </svg>

              <span className="sr-only">Prompt</span>
            </button>
          </form>
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 gap-4 gap-8 grow">
            <div className="hidden lg:block">
              <div className="">
                <div className="py-4 flex items-center justify-between rounded-t-[10px]">
                  Code
                  <button
                    onClick={() => handleClipboard(code)}
                    className="size-7 flex items-center justify-center p-1 rounded-full bg-[#1b1b1b] hover:bg-gray-800"
                  >
                    <CopyIcon />
                    <span className="sr-only">Copy code</span>
                  </button>
                </div>
                <div className="overflow-hidden border-2 border-white rounded-xl">
                  <SyntaxHighlighter
                    language="typescript"
                    style={{
                      "hljs": {
                        "display": "block",
                        "overflowX": "auto",
                        "padding": "0.5em",
                        "background": "#272822",
                        "color": "#ddd",
                      },
                      "hljs-tag": {
                        "color": "#f92672",
                      },
                      "hljs-keyword": {
                        "color": "#f92672",
                        "fontWeight": "bold",
                      },
                      "hljs-selector-tag": {
                        "color": "#f92672",
                        "fontWeight": "bold",
                      },
                      "hljs-literal": {
                        "color": "#f92672",
                        "fontWeight": "bold",
                      },
                      "hljs-strong": {
                        "color": "#f92672",
                      },
                      "hljs-name": {
                        "color": "#f92672",
                      },
                      "hljs-code": {
                        "color": "#66d9ef",
                      },
                      "hljs-class .hljs-title": {
                        "color": "white",
                      },
                      "hljs-attribute": {
                        "color": "#bf79db",
                      },
                      "hljs-symbol": {
                        "color": "#bf79db",
                      },
                      "hljs-regexp": {
                        "color": "#bf79db",
                      },
                      "hljs-link": {
                        "color": "#bf79db",
                      },
                      "hljs-string": {
                        "color": "#a6e22e",
                      },
                      "hljs-bullet": {
                        "color": "#a6e22e",
                      },
                      "hljs-subst": {
                        "color": "#a6e22e",
                      },
                      "hljs-title": {
                        "color": "#a6e22e",
                        "fontWeight": "bold",
                      },
                      "hljs-section": {
                        "color": "#a6e22e",
                        "fontWeight": "bold",
                      },
                      "hljs-emphasis": {
                        "color": "#a6e22e",
                      },
                      "hljs-type": {
                        "color": "#a6e22e",
                        "fontWeight": "bold",
                      },
                      "hljs-built_in": {
                        "color": "#a6e22e",
                      },
                      "hljs-builtin-name": {
                        "color": "#a6e22e",
                      },
                      "hljs-selector-attr": {
                        "color": "#a6e22e",
                      },
                      "hljs-selector-pseudo": {
                        "color": "#a6e22e",
                      },
                      "hljs-addition": {
                        "color": "#a6e22e",
                      },
                      "hljs-variable": {
                        "color": "#a6e22e",
                      },
                      "hljs-template-tag": {
                        "color": "#a6e22e",
                      },
                      "hljs-template-variable": {
                        "color": "#a6e22e",
                      },
                      "hljs-comment": {
                        "color": "#75715e",
                      },
                      "hljs-quote": {
                        "color": "#75715e",
                      },
                      "hljs-deletion": {
                        "color": "#75715e",
                      },
                      "hljs-meta": {
                        "color": "#75715e",
                      },
                      "hljs-doctag": {
                        "fontWeight": "bold",
                      },
                      "hljs-selector-id": {
                        "fontWeight": "bold",
                      },
                    }}
                    customStyle={{
                      maxHeight: "53svh",
                      overflow: "auto",
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-8 w-full grow" ref={previewRef}>
              <div className="flex flex-col grow">
                <div className="p-4 flex items-center justify-between rounded-t-[10px]">
                  Preview
                  <div className="flex items-center gap-2 ">
                    <button
                      onClick={handleRefresh}
                      className="size-7 p-1 flex items-center justify-center rounded-full bg-[#1b1b1b] hover:cursor-pointer hover:bg-gray-800"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clip-path="url(#clip0_23_817)">
                          <path
                            d="M3.49206 10.63C2.92113 10.1159 2.50927 9.49955 2.23943 8.83773C1.52364 7.08235 1.85881 4.99463 3.25631 3.55453L4.54586 4.84409C4.61687 4.9151 4.74469 4.86397 4.76173 4.75887L5.46616 0.148857C5.47752 0.0721652 5.41219 0.00683533 5.3355 0.018197L0.722641 0.722624C0.617545 0.739666 0.566417 0.867486 0.637428 0.938496L1.92982 2.23089C-0.203339 4.41234 -0.566915 7.68452 0.833418 10.2409C1.2538 11.0107 1.83609 11.7151 2.57744 12.3059C3.83859 13.3086 5.38947 13.7886 6.92898 13.7574L7.21871 11.8628C5.89223 11.9764 4.52882 11.5674 3.49206 10.63Z"
                            fill="white"
                          />
                          <path
                            d="M12.0701 11.769C14.2033 9.5876 14.5669 6.31542 13.1665 3.75903C12.7462 2.98928 12.1639 2.28485 11.4225 1.69404C10.1614 0.69137 8.61049 0.211337 7.07097 0.242582L6.78125 2.13715C8.10489 2.02353 9.47114 2.43255 10.5079 3.3699C11.0788 3.88401 11.4907 4.50039 11.7605 5.16221C12.4763 6.91759 12.1411 9.00531 10.7437 10.4454L9.4541 9.15585C9.38309 9.08484 9.25527 9.13597 9.23822 9.24106L8.5338 13.8511C8.52243 13.9278 8.58776 13.9931 8.66446 13.9817L13.2773 13.2773C13.3824 13.2603 13.4307 13.1325 13.3625 13.0614L12.0701 11.769Z"
                            fill="white"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_23_817">
                            <rect width="14" height="14" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>

                      <span className="sr-only">Refresh</span>
                    </button>
                    <a
                      href={projectURL}
                      target="_blank"
                      className="size-7 p-1 flex items-center justify-center rounded-full bg-[#1b1b1b] hover:cursor-pointer hover:bg-gray-800"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M15 3h6v6"></path>
                        <path d="M10 14 21 3"></path>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      </svg>
                    </a>
                    <button
                      onClick={() => setShareModalOpen(true)}
                      className="bg-white h-8 text-black font-medium flex items-center gap-1 shadow-button px-4 py-2 rounded-full hover:cursor-pointer hover:bg-opacity-90"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M11.853 4.30785L6.8843 0.792225C6.77648 0.714975 6.63572 0.705014 6.519 0.765788C6.40158 0.825858 6.3281 0.946374 6.3281 1.07821V2.8453C2.8077 3.02863 0 5.95065 0 9.51571V10.922C0 11.0974 0.129094 11.2457 0.302813 11.2701C0.472336 11.2948 0.640875 11.1898 0.689391 11.0188L0.743625 10.8289C1.46461 8.30619 3.73123 6.5113 6.32812 6.36161V8.10946C6.32812 8.2413 6.4016 8.36181 6.51902 8.42188C6.63574 8.48266 6.77651 8.47201 6.88432 8.39544L11.8531 4.87982C11.9451 4.81389 12 4.70746 12 4.59383C12 4.48021 11.9451 4.37376 11.853 4.30785Z"
                          fill="#0C0F16"
                        />
                      </svg>

                      <span>Share</span>
                    </button>
                  </div>
                </div>
                <div className="bg-white w-full h-full flex flex-col grow rounded-xl border-2 border-white overflow-hidden">
                  <React.Fragment key={iframeKey}>
                    <iframe
                      srcDoc={code}
                      sandbox="allow-scripts allow-modals allow-forms allow-popups allow-same-origin allow-top-navigation allow-downloads allow-presentation allow-pointer-lock"
                      className="w-full grow"
                    />
                  </React.Fragment>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center py-2 px-4 ">
            <p className="text-sm font-dm-sans text-gray-400 mb-2 flex gap-2">
              <button onClick={() => handleVersionChange("back")} disabled={versionHistory.currentVersionIndex === 0}>
                ←
              </button>
              Version: {versionHistory.currentVersionIndex + 1} / {versionHistory.versions.length}
              <button
                onClick={() => handleVersionChange("forward")}
                disabled={versionHistory.currentVersionIndex === versionHistory.versions.length - 1}
              >
                →
              </button>
            </p>
            <div className="font-dm-sans relative flex justify-center items-center gap-3 lg:gap-8">
              <div className="text-[#7D45CC] flex items-center gap-1 lg:gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.625 11.25H1.875C1.52982 11.25 1.25 11.5298 1.25 11.875V18.125C1.25 18.4702 1.52982 18.75 1.875 18.75H5.625C5.97018 18.75 6.25 18.4702 6.25 18.125V11.875C6.25 11.5298 5.97018 11.25 5.625 11.25Z"
                    fill="#7D45CC"
                  />
                  <path
                    d="M18.125 6.25H14.375C14.0298 6.25 13.75 6.52982 13.75 6.875V18.125C13.75 18.4702 14.0298 18.75 14.375 18.75H18.125C18.4702 18.75 18.75 18.4702 18.75 18.125V6.875C18.75 6.52982 18.4702 6.25 18.125 6.25Z"
                    fill="#7D45CC"
                  />
                  <path
                    d="M11.875 1.25H8.125C7.77982 1.25 7.5 1.52982 7.5 1.875V18.125C7.5 18.4702 7.77982 18.75 8.125 18.75H11.875C12.2202 18.75 12.5 18.4702 12.5 18.125V1.875C12.5 1.52982 12.2202 1.25 11.875 1.25Z"
                    fill="#7D45CC"
                  />
                </svg>
                <p className="text-sm lg:text-base">
                  <strong>{performance.tokensPerSecond.toFixed(2)}</strong> tokens
                </p>
              </div>

              <div className="text-[#457FCC] flex items-center gap-1 lg:gap-2">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 17 17"
                  fill="none"
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g clip-path="url(#clip0_23_833)">
                    <path
                      d="M13.8124 6.74803H9.91772L12.9721 1.19466C13.1439 0.88225 12.9178 0.5 12.5613 0.5H6.93672C6.73863 0.5 6.56191 0.624531 6.49528 0.811094L3.37097 9.55912C3.26194 9.86441 3.48825 10.1855 3.81241 10.1855H8.24172L7.10256 15.9382C7.00438 16.4341 7.65234 16.7127 7.94475 16.3004L14.1947 7.48794C14.4149 7.17753 14.1929 6.74803 13.8124 6.74803Z"
                      fill="#457FCC"
                    />
                    <path
                      opacity="0.5"
                      d="M5.74606 15.4909C5.99993 15.5417 6.24687 15.377 6.29765 15.1232L6.98509 11.6856C7.03587 11.4318 6.87121 11.1848 6.61737 11.1341C6.36353 11.0833 6.11656 11.2479 6.06577 11.5018L5.37834 14.9393C5.32756 15.1932 5.49218 15.4401 5.74606 15.4909Z"
                      fill="#457FCC"
                    />
                    <path
                      opacity="0.9"
                      d="M1.77997 9.83524C2.02378 9.9223 2.292 9.79527 2.37906 9.55146L4.38797 3.92645C4.47503 3.68264 4.348 3.41442 4.10418 3.32736C3.86037 3.2403 3.59215 3.36733 3.50509 3.61114L1.49618 9.23614C1.40912 9.47996 1.53615 9.74817 1.77997 9.83524Z"
                      fill="#457FCC"
                    />
                    <path
                      opacity="0.5"
                      d="M14.2915 0.742937L12.5728 3.86794C12.448 4.09478 12.5308 4.37978 12.7576 4.50456C12.9844 4.62931 13.2694 4.54659 13.3942 4.31975L15.113 1.19475C15.2377 0.967906 15.155 0.682906 14.9282 0.558125C14.7013 0.433343 14.4163 0.516093 14.2915 0.742937Z"
                      fill="#457FCC"
                    />
                    <path
                      d="M9.59786 16.4152C9.80995 16.5637 10.1022 16.5122 10.2507 16.3001L12.4829 13.1126C12.6314 12.9005 12.5799 12.6082 12.3679 12.4597L12.3678 12.4597C12.1558 12.3112 11.8635 12.3627 11.715 12.5748L9.4828 15.7623C9.33427 15.9744 9.3858 16.2667 9.59786 16.4152Z"
                      fill="#457FCC"
                    />
                    <path
                      opacity="0.7"
                      d="M14.681 8.42217L13.5649 9.9847C13.4144 10.1954 13.4632 10.4881 13.6739 10.6386H13.6739C13.8845 10.789 14.1773 10.7403 14.3278 10.5296L15.4439 8.96708C15.5943 8.75642 15.5455 8.46367 15.3349 8.3132C15.1242 8.1627 14.8315 8.21148 14.681 8.42217Z"
                      fill="#457FCC"
                    />
                  </g>
                  <defs>
                    <clipPath id="clip0_23_833">
                      <rect
                        width="16"
                        height="16"
                        fill="white"
                        transform="translate(0.5 0.5)"
                      />
                    </clipPath>
                  </defs>
                </svg>

                <p className="text-sm lg:text-base">
                  <strong>{performance.totalTokens}</strong> token/s
                </p>
              </div>

              <div className="text-[#45CC79] flex items-center gap-1 lg:gap-2">
                <svg
                  width="20"
                  height="21"
                  viewBox="0 0 20 21"
                  fill="none"
                  className="shrink-0"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9.99981 19.4583C8.50955 19.4611 7.05464 19.0045 5.83314 18.1508C5.69711 18.056 5.60431 17.9111 5.57517 17.7478C5.54602 17.5846 5.58291 17.4165 5.67773 17.2804C5.77254 17.1444 5.91751 17.0516 6.08075 17.0224C6.24398 16.9933 6.41211 17.0302 6.54814 17.125C7.45409 17.7557 8.51553 18.1262 9.6172 18.1962C10.7189 18.2662 11.8186 18.033 12.7971 17.5219C13.7756 17.0109 14.5954 16.2416 15.1674 15.2975C15.7394 14.3533 16.0419 13.2706 16.0419 12.1667C16.0419 11.0628 15.7394 9.97999 15.1674 9.03588C14.5954 8.09177 13.7756 7.32243 12.7971 6.8114C11.8186 6.30036 10.7189 6.06717 9.6172 6.13715C8.51553 6.20713 7.45409 6.5776 6.54814 7.20833C6.48079 7.25528 6.40484 7.2885 6.32465 7.3061C6.24445 7.3237 6.16157 7.32533 6.08075 7.3109C5.99992 7.29646 5.92273 7.26625 5.85358 7.22199C5.78443 7.17773 5.72468 7.12028 5.67773 7.05292C5.63078 6.98556 5.59756 6.90962 5.57996 6.82942C5.56236 6.74922 5.56073 6.66635 5.57517 6.58552C5.60431 6.42229 5.69711 6.27732 5.83314 6.1825C6.77241 5.52857 7.85241 5.10491 8.98578 4.9458C10.1192 4.7867 11.2741 4.89662 12.3571 5.26666C13.4401 5.63671 14.4208 6.25649 15.2198 7.07587C16.0189 7.89524 16.6138 8.8912 16.9565 9.98317C17.2992 11.0751 17.3801 12.2324 17.1926 13.3615C17.005 14.4905 16.5544 15.5595 15.877 16.482C15.1997 17.4046 14.3147 18.1547 13.2937 18.6718C12.2727 19.1888 11.1443 19.4583 9.99981 19.4583Z"
                    fill="#45CC79"
                  />
                  <path
                    d="M5.83333 13.2084H2.5C2.33424 13.2084 2.17527 13.1425 2.05806 13.0253C1.94085 12.9081 1.875 12.7491 1.875 12.5834C1.875 12.4176 1.94085 12.2586 2.05806 12.1414C2.17527 12.0242 2.33424 11.9584 2.5 11.9584H5.83333C5.99909 11.9584 6.15807 12.0242 6.27528 12.1414C6.39249 12.2586 6.45833 12.4176 6.45833 12.5834C6.45833 12.7491 6.39249 12.9081 6.27528 13.0253C6.15807 13.1425 5.99909 13.2084 5.83333 13.2084Z"
                    fill="#45CC79"
                  />
                  <path
                    d="M6.39984 10.7084H1.6665C1.50074 10.7084 1.34177 10.6425 1.22456 10.5253C1.10735 10.4081 1.0415 10.2491 1.0415 10.0834C1.0415 9.91761 1.10735 9.75864 1.22456 9.64143C1.34177 9.52422 1.50074 9.45837 1.6665 9.45837H6.39984C6.5656 9.45837 6.72457 9.52422 6.84178 9.64143C6.95899 9.75864 7.02484 9.91761 7.02484 10.0834C7.02484 10.2491 6.95899 10.4081 6.84178 10.5253C6.72457 10.6425 6.5656 10.7084 6.39984 10.7084Z"
                    fill="#45CC79"
                  />
                  <path
                    d="M6.6665 15.7084H1.6665C1.50074 15.7084 1.34177 15.6425 1.22456 15.5253C1.10735 15.4081 1.0415 15.2491 1.0415 15.0834C1.0415 14.9176 1.10735 14.7586 1.22456 14.6414C1.34177 14.5242 1.50074 14.4584 1.6665 14.4584H6.6665C6.83226 14.4584 6.99123 14.5242 7.10845 14.6414C7.22566 14.7586 7.2915 14.9176 7.2915 15.0834C7.2915 15.2491 7.22566 15.4081 7.10845 15.5253C6.99123 15.6425 6.83226 15.7084 6.6665 15.7084Z"
                    fill="#45CC79"
                  />
                  <path
                    d="M18.016 3.53415L15.206 1.73999C14.8797 1.53258 14.4844 1.46304 14.1068 1.54661C13.7292 1.63019 13.4002 1.86005 13.1919 2.18582L12.7435 2.88832C12.5359 3.2144 12.4661 3.60956 12.5495 3.98704C12.633 4.36452 12.8628 4.69347 13.1885 4.90165L16.0002 6.69499C16.3264 6.90172 16.7212 6.97096 17.0982 6.88758C17.4753 6.8042 17.8041 6.57498 18.0127 6.24999L18.461 5.54749C18.6683 5.22128 18.7378 4.82626 18.6544 4.44891C18.571 4.07156 18.3414 3.74263 18.016 3.53415Z"
                    fill="#45CC79"
                  />
                  <path
                    d="M14.0324 7.30164C13.9205 7.30141 13.8107 7.27114 13.7145 7.21398C13.6183 7.15681 13.5392 7.07487 13.4854 6.97669C13.4317 6.87851 13.4053 6.76771 13.409 6.65585C13.4128 6.544 13.4464 6.43519 13.5066 6.34081L14.4024 4.93581C14.4466 4.86659 14.5039 4.80675 14.5712 4.75969C14.6385 4.71264 14.7144 4.67931 14.7946 4.66159C14.8747 4.64387 14.9576 4.64211 15.0385 4.65642C15.1193 4.67072 15.1965 4.70081 15.2658 4.74497C15.335 4.78913 15.3948 4.84649 15.4419 4.91377C15.4889 4.98106 15.5223 5.05695 15.54 5.13712C15.5577 5.21728 15.5594 5.30016 15.5451 5.381C15.5308 5.46185 15.5007 5.53909 15.4566 5.60831L14.5599 7.01247C14.5036 7.10132 14.4257 7.17444 14.3334 7.225C14.2412 7.27557 14.1376 7.30194 14.0324 7.30164Z"
                    fill="#45CC79"
                  />
                  <path
                    d="M10.0002 7.37498C9.05246 7.37498 8.12604 7.65601 7.33806 8.18253C6.55007 8.70904 5.93591 9.4574 5.57324 10.333C5.21057 11.2085 5.11568 12.172 5.30057 13.1015C5.48546 14.031 5.94182 14.8847 6.61194 15.5549C7.28207 16.225 8.13587 16.6814 9.06536 16.8662C9.99485 17.0511 10.9583 16.9562 11.8339 16.5936C12.7094 16.2309 13.4578 15.6167 13.9843 14.8288C14.5108 14.0408 14.7918 13.1144 14.7918 12.1667C14.796 11.5362 14.675 10.9112 14.4357 10.328C14.1963 9.74474 13.8436 9.21484 13.3978 8.76905C12.952 8.32326 12.4221 7.97047 11.8388 7.73116C11.2556 7.49184 10.6306 7.37078 10.0002 7.37498ZM12.0768 11.1917L11.226 11.93C11.2417 12.0079 11.2498 12.0872 11.2502 12.1667C11.2544 12.4371 11.1722 12.7017 11.0156 12.9222C10.8589 13.1426 10.636 13.3073 10.3793 13.3923C10.1225 13.4772 9.84536 13.478 9.58814 13.3945C9.33092 13.311 9.10708 13.1476 8.9492 12.928C8.79133 12.7084 8.70766 12.4442 8.71039 12.1738C8.71311 11.9033 8.80209 11.6409 8.96436 11.4245C9.12664 11.2082 9.35373 11.0493 9.61258 10.971C9.87143 10.8927 10.1485 10.899 10.4035 10.9892L11.2568 10.2475C11.382 10.1387 11.5453 10.0842 11.7107 10.0958C11.8762 10.1075 12.0302 10.1844 12.1389 10.3096C12.2477 10.4348 12.3022 10.598 12.2906 10.7635C12.2789 10.9289 12.202 11.0829 12.0768 11.1917Z"
                    fill="#45CC79"
                  />
                </svg>

                <p className="text-sm lg:text-base">
                  <strong>{performance.time.toFixed(2)}</strong>s
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer className="flex flex-col text-gray-400 md:flex-row gap-4 w-full justify-between items-center max-w-screen-xl mx-auto p-8">
        <div className="flex lg:flex-col flex-col-reverse">
          <div>
            If your app needs a backend, try{" "}
            <a
              className="text-blue-500 hover:text-blue-400 transition-colors italic font-bold"
              href="https://www.val.town/townie?utm-source=cerebrascoder"
              target="_blank"
            >
              Townie
            </a>!
          </div>
          <div className="flex items-center gap-1.5">
            <p>
              Made{"    "}
              <span className="hidden md:inline-block">
                by{"  "}
                <a
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                  href="https://x.com/YoussefUiUx"
                  target="_blank"
                >
                  Youssef
                </a>,{" "}
                <a
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                  href="https://www.val.town/u/the_samoudi"
                  target="_blank"
                >
                  Anas
                </a>,{"  "}and{"  "}
                <a
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                  href="https://www.val.town/u/stevekrouse"
                  target="_blank"
                >
                  Steve
                </a>
              </span>{"  "}
              in
            </p>

            <a className="" href={valURL}>
              <ValTownSVG color="#9ca3af" />
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <svg
            width="38"
            height="38"
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M38 19C38 22.7578 36.8857 26.4313 34.7979 29.5558C32.7102 32.6804 29.7428 35.1156 26.271 36.5537C22.7992 37.9918 18.9789 38.368 15.2933 37.6349C11.6076 36.9018 8.22217 35.0922 5.56497 32.435C2.90777 29.7778 1.0982 26.3924 0.36508 22.7067C-0.36804 19.0211 0.00822388 15.2008 1.44629 11.729C2.88435 8.25722 5.31963 5.28982 8.44417 3.20208C11.5687 1.11433 15.2422 -4.48119e-08 19 0V19H38Z"
              fill="#575757"
            />
            <path
              d="M18.9994 34.3562C15.9623 34.3562 12.9933 33.4556 10.468 31.7682C7.94272 30.0809 5.9745 27.6826 4.81223 24.8766C3.64997 22.0707 3.34587 18.9831 3.93839 16.0043C4.5309 13.0255 5.99343 10.2893 8.14101 8.14173C10.2886 5.99415 13.0248 4.53162 16.0036 3.9391C18.9824 3.34659 22.07 3.65069 24.8759 4.81295C27.6819 5.97522 30.0802 7.94345 31.7675 10.4687C33.4549 12.994 34.3555 15.963 34.3555 19.0001L18.9994 19.0001L18.9994 34.3562Z"
              fill="white"
            />
            <path
              d="M9.5 19C9.5 17.1211 10.0572 15.2843 11.101 13.7221C12.1449 12.1598 13.6286 10.9422 15.3645 10.2231C17.1004 9.50411 19.0105 9.31598 20.8534 9.68254C22.6962 10.0491 24.3889 10.9539 25.7175 12.2825C27.0461 13.6111 27.9509 15.3038 28.3175 17.1466C28.684 18.9895 28.4959 20.8996 27.7769 22.6355C27.0578 24.3714 25.8402 25.8551 24.2779 26.899C22.7156 27.9428 20.8789 28.5 19 28.5L19 19L9.5 19Z"
              fill="#0C0F16"
            />
          </svg>
        </div>
      </footer>
    </div>
  );
}

const valURL = import.meta.url.replace("esm", "val").split("?")[0];

const ValTownSVG = ({ color }: { color?: string } = { color: "white" }) => (
  <svg
    className="rounded-md"
    style={{ width: "73px" }}
    viewBox="75 75 450 94"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_1045_720)">
      <path
        d="M171.182 146.387C175.072 146.387 178.246 145.305 180.706 143.139C183.165 140.975 184.395 138.093 184.395 134.495V133.394H170.411C167.841 133.394 165.822 133.945 164.355 135.046C162.885 136.147 162.153 137.688 162.153 139.67C162.153 141.652 162.924 143.268 164.465 144.515C166.007 145.764 168.245 146.387 171.182 146.387ZM168.76 157.618C164.867 157.618 161.382 156.939 158.299 155.581C155.216 154.224 152.775 152.242 150.977 149.635C149.177 147.031 148.279 143.855 148.279 140.111C148.279 136.367 149.177 133.229 150.977 130.696C152.775 128.164 155.271 126.256 158.464 124.971C161.657 123.687 165.308 123.044 169.42 123.044H184.395V119.961C184.395 117.392 183.586 115.281 181.973 113.629C180.357 111.978 177.788 111.152 174.265 111.152C170.814 111.152 168.245 111.942 166.557 113.519C164.867 115.099 163.766 117.136 163.254 119.63L150.481 115.336C151.362 112.547 152.775 109.996 154.72 107.683C156.664 105.371 159.271 103.5 162.538 102.068C165.804 100.637 169.786 99.921 174.485 99.921C181.678 99.921 187.368 101.721 191.552 105.316C195.736 108.914 197.828 114.125 197.828 120.952V141.322C197.828 143.524 198.856 144.626 200.911 144.626H205.315V156.077H196.067C193.35 156.077 191.111 155.416 189.35 154.095C187.588 152.773 186.707 151.012 186.707 148.809V148.7H184.615C184.321 149.58 183.661 150.737 182.633 152.168C181.604 153.599 179.991 154.866 177.788 155.967C175.586 157.068 172.575 157.618 168.76 157.618Z"
        fill={color}
      />
      <path d="M228.217 78.999H214.343V156.076H228.217V78.999Z" fill={color} />
      <path
        d="M290.318 156.077C286.721 156.077 283.802 154.958 281.564 152.719C279.324 150.481 278.206 147.488 278.206 143.745V112.914H264.552V101.462H278.206V84.505H292.079V101.462H307.055V112.914H292.079V141.322C292.079 143.524 293.107 144.626 295.163 144.626H305.733V156.077H290.318Z"
        fill={color}
      />
      <path
        d="M342.51 145.286C346.767 145.286 350.29 143.91 353.081 141.157C355.87 138.404 357.265 134.459 357.265 129.32V128.219C357.265 123.082 355.888 119.135 353.135 116.382C350.383 113.629 346.84 112.253 342.51 112.253C338.252 112.253 334.729 113.629 331.939 116.382C329.149 119.135 327.755 123.082 327.755 128.219V129.32C327.755 134.459 329.149 138.404 331.939 141.157C334.729 143.91 338.252 145.286 342.51 145.286ZM342.51 157.618C337.077 157.618 332.196 156.517 327.865 154.315C323.533 152.113 320.12 148.919 317.625 144.735C315.129 140.551 313.881 135.524 313.881 129.65V127.888C313.881 122.017 315.129 116.988 317.625 112.803C320.12 108.619 323.533 105.426 327.865 103.224C332.196 101.022 337.077 99.921 342.51 99.921C347.942 99.921 352.823 101.022 357.155 103.224C361.485 105.426 364.898 108.619 367.395 112.803C369.89 116.988 371.139 122.017 371.139 127.888V129.65C371.139 135.524 369.89 140.551 367.395 144.735C364.898 148.919 361.485 152.113 357.155 154.315C352.823 156.517 347.942 157.618 342.51 157.618Z"
        fill={color}
      />
      <path
        d="M385.901 148.327L379.287 101.462H393.05L397.895 146.717H399.877L405.738 109.085C406.421 104.697 410.199 101.462 414.639 101.462H421.452C425.892 101.462 429.67 104.697 430.353 109.085L436.214 146.717H438.196L443.041 101.462H456.804L450.19 148.327C449.563 152.772 445.759 156.077 441.27 156.077H433.798C429.358 156.077 425.58 152.841 424.897 148.454L419.037 110.821H417.054L411.194 148.454C410.511 152.841 406.733 156.077 402.293 156.077H394.821C390.332 156.077 386.528 152.772 385.901 148.327Z"
        fill={color}
      />
      <path
        d="M467.815 156.077V101.462H481.469V108.62H483.451C484.332 106.711 485.983 104.895 488.405 103.169C490.828 101.446 494.498 100.582 499.417 100.582C503.673 100.582 507.399 101.556 510.593 103.5C513.786 105.445 516.263 108.124 518.025 111.537C519.786 114.951 520.667 118.934 520.667 123.484V156.077H506.794V124.585C506.794 120.476 505.784 117.392 503.766 115.336C501.746 113.282 498.866 112.253 495.122 112.253C490.864 112.253 487.561 113.668 485.212 116.492C482.862 119.319 481.689 123.264 481.689 128.329V156.077H467.815Z"
        fill={color}
      />
      <path
        d="M134.934 101.463L108.115 145.947H106.133V109.185C106.133 104.92 102.676 101.463 98.4109 101.463H92.2599V147.069C92.2599 152.044 96.2929 156.078 101.268 156.078H111.275C115.918 156.078 120.209 153.601 122.532 149.581L150.332 101.463H134.934Z"
        fill={color}
      />
      <path d="M79 101.458H92.903V112.91H79V101.458Z" fill={color} />
    </g>
    <defs>
      <clipPath id="clip0_1045_720">
        <rect width="442" height="85" fill={color} transform="translate(79 79)" />
      </clipPath>
    </defs>
  </svg>
);

const CopyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_23_787)">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M4.0835 1.74995C4.0835 1.10561 4.60584 0.583278 5.25017 0.583282L12.2502 0.583334C12.8945 0.583337 13.4168 1.10567 13.4168 1.75V8.74995C13.4168 9.3943 12.8945 9.91661 12.2502 9.91661H11.6668C11.3447 9.91661 11.0835 9.65545 11.0835 9.33328V4.95831C11.0835 3.83073 10.1694 2.91664 9.04183 2.91664H4.66683C4.34466 2.91664 4.0835 2.65548 4.0835 2.33331V1.74995ZM0.583496 5.25005C0.583496 4.60572 1.10583 4.08338 1.75016 4.08338L8.75016 4.0834C9.39451 4.0834 9.91683 4.60573 9.91683 5.25006V12.25C9.91683 12.8944 9.39451 13.4167 8.75016 13.4167H1.75016C1.10583 13.4167 0.583496 12.8944 0.583496 12.25V5.25005Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_23_787">
        <rect width="14" height="14" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

function client() {
  const path = window.location.pathname;
  const root = createRoot(document.getElementById("root")!);

  root.render(<App />);
}

const KEY = "cerebras_coder2";
const SCHEMA_VERSION = 5;

if (typeof document !== "undefined") {
  client();
} else {
  // Create tables for tracking generations
  const { sqlite } = await import("https://esm.town/v/stevekrouse/sqlite");
  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_projects_${SCHEMA_VERSION} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      initial_prompt TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await sqlite.execute(`
    CREATE TABLE IF NOT EXISTS ${KEY}_iterations_${SCHEMA_VERSION} (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      version_number INTEGER NOT NULL,
      prompt TEXT NOT NULL,
      code TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(project_id) REFERENCES ${KEY}_projects_${SCHEMA_VERSION}(id)
    )
  `);
}

function extractCodeFromFence(text: string): string {
  const htmlMatch = text.match(/```html\n([\s\S]*?)\n```/);
  return htmlMatch ? htmlMatch[1].trim() : text;
}

async function generateCode(prompt: string, currentCode: string) {
  const starterPrompt = STARTER_PROMPTS.find(p => p.prompt === prompt);
  if (starterPrompt) {
    return {
      code: starterPrompt.code,
      time: starterPrompt.performance.time,
      totalTokens: starterPrompt.performance.totalTokens,
    };
  } else {
    const client = new Cerebras({ apiKey: Deno.env.get("CEREBRAS_API_KEY") });
    const completion = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an advanced AI coding assistant that generates websites. 
            
            Include all necessary HTML, CSS, and JavaScript in a single complete HTML file.
            Avoid use of alert or input. Make yourself a modal if you need it.
            Unless otherwise specified, use a UI libray. Be sure to install it via CDN.
            Make the app look like a polished, pretty, full website.
            Before coding, write your plan in a \`\`\`thinking code fence. 
            Always wrap your response in \`\`\`html code fences.`,
        },
        currentCode
          ? {
            role: "system",
            content: `Current code to modify:\n\`\`\`html\n${currentCode}\n\`\`\``,
          }
          : undefined,
        {
          role: "user",
          content: prompt,
        },
      ].filter(Boolean),
      model: "llama-3.3-70b",
    });
    return {
      code: extractCodeFromFence(completion.choices[0].message.content),
      time: completion.time_info.completion_time,
      totalTokens: completion.usage?.completion_tokens || 1,
    };
  }
}

export default async function server(req: Request): Promise<Response> {
  // Dynamic import for SQLite to avoid client-side import
  const { sqlite } = await import("https://esm.town/v/stevekrouse/sqlite");

  if (req.method === "POST") {
    let { prompt, currentCode, versionHistory, projectId } = await req.json();

    const { code, time, totalTokens } = await generateCode(prompt, currentCode);

    // If no version history exists, create a new project
    let versionNumber = 0;
    if (!projectId) {
      const projectResult = await sqlite.execute(
        `INSERT INTO ${KEY}_projects_${SCHEMA_VERSION} (initial_prompt) VALUES (?)`,
        [prompt],
      );
      projectId = projectResult.lastInsertRowid as unknown as number;
    } else {
      // get last version number for this project id
      const data = await sqlite.execute(
        `SELECT version_number FROM ${KEY}_iterations_${SCHEMA_VERSION}
        WHERE project_id = ? ORDER BY version_number DESC LIMIT 1`,
        [projectId],
      );
      const currentVersion = data.rows[0]?.version_number as unknown as number || 0;
      versionNumber = currentVersion + 1;
    }

    await sqlite.execute(
      `INSERT INTO ${KEY}_iterations_${SCHEMA_VERSION} 
      (project_id, version_number, prompt, code) VALUES (?, ?, ?, ?)`,
      [projectId, versionNumber, prompt, code],
    );

    return new Response(
      JSON.stringify({
        code,
        projectId,
        versionNumber,
        performance: {
          tokensPerSecond: totalTokens / time,
          totalTokens,
          time,
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // output url in format /p/:project/v/:version
  const url = new URL(req.url);
  if (url.pathname.startsWith("/p/")) {
    const [, , project, , version] = url.pathname.split("/");
    let data;
    if (version === undefined) {
      data = await sqlite.execute(
        `SELECT code FROM cerebras_coder2_iterations_5
      WHERE project_id = ?
      ORDER BY version_number desc
      LIMIT 1`,
        [parseInt(project)],
      );
    } else {
      data = await sqlite.execute(
        `SELECT code FROM cerebras_coder2_iterations_5
      WHERE project_id = ? AND version_number = ?
      LIMIT 1`,
        [parseInt(project), parseInt(version)],
      );
    }
    const code = data.rows[0]?.code;
    if (!code) {
      return new Response("Not found", { status: 404 });
    }
    return new Response(code as string, {
      headers: { "Content-Type": "text/html" },
    });
  }

  return new Response(
    `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CerebrasCoder</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css"
      rel="stylesheet"
    />

    
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/toastify-js"></script>

    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      :root {
        --dark: #0c0f16;
        --grey: #5a5a5a;
        --deepblue: #0549c7;
      }
      * {
        font-family: "DM Sans", sans-serif;
      }

      pre{
            background-color: black !important;
        }

      .font-dm-mono {
        font-family: "DM Mono", monospace;
      }

      .font-dm-sans {
        font-family: "DM Sans", sans-serif;
      }

      .shadow-button {
        box-shadow: inset 0px -2px 1px 1px #00000078,
          inset 0px -1px 0.5px 0 #000000;
      }
    </style>
      </head>
       <body class="bg-[#0C0F16] text-white">
        <div id="root"></div>
        <script src="https://esm.town/v/std/catch"></script>
        <script type="module" src="${import.meta.url}"></script>
      </body>
    </html>
  `,
    {
      headers: { "Content-Type": "text/html" },
    },
  );
}
