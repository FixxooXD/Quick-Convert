export const Nav = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="container px-4">
        <div className="flex items-center justify-between h-16">
          <span className="text-xl font-bold text-orange-600">FileConverter</span>
          <div className="flex space-x-4">
            {/* <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition duration-300 ease-in-out">
              Word to PDF
            </button>
            <button className="px-4 py-/*-/2 text-sm font-medium text-gray-700 hover:text-orange-600 transition duration-300 ease-in-out">
              PDF to Word
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  )
};

