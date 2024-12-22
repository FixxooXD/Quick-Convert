export const Nav = () => {
  // { setConverteTo }: { setConverteTo: (format: string) => void }
  return (
    <div className="flex flex-row h-[2rem] border-2 justify-between">
      <span>Nav</span>
      <div className="flex justify-around w-[50%]">
        <button>Convert Word to PDF</button>
        <button>Convert PDF to Word</button>
      </div>
    </div>
  )
};

