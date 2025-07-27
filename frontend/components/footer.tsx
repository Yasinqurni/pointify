import Image from "next/image";

export default function Footer() {
  return (
    <div className="border-2 border-indigo-300 rounded-2xl p-5 h-fit mb-10">
      <div className="flex flex-row gap-1 items-center">
        <h1 className="font-almarai font-semibold text-slate-800 text-[16px]">
          Pointify
          <p className="text-[12px] font-almarai text-slate-500 font-normal -mt-1">
            Web3 Loyalty Platform
          </p>
        </h1>
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex flex-col gap-1 mt-10 bg-rose-200 p-5 rounded-xl w-fit">
          <h1 className="text-rose-800 text-[14px] font-semibold font-almarai">
            Ingin Bergabung dengan Pointify? <br />
            <span className="text-rose-500">Hubungi Kami</span>
          </h1>
          <div className="flex flex-row items-center gap-2">
            {/* email svg */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-[16px] text-rose-400"
            >
              <path d="M1.5 8.67v8.58a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V8.67l-8.928 5.493a3 3 0 0 1-3.144 0L1.5 8.67Z" />
              <path d="M22.5 6.908V6.75a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3v.158l9.714 5.978a1.5 1.5 0 0 0 1.572 0L22.5 6.908Z" />
            </svg>

            <p className="text-[14px] font-notoSans text-rose-700">
              pointify@gmail.com
            </p>
          </div>
        </div>
        <div className="h-full flex items-end justify-end">
          <p className="text-slate-800 text-[13px] font-semibold">
            @Pointify All Rights. Reserved
          </p>
        </div>
      </div>
    </div>
  );
}
