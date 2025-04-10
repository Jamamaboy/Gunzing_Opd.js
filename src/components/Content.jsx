export default function Content() {
  const items = [
    { id: 1, image: "/images/gunLogo.png", label: "อาวุธปืน" },
    { id: 2, image: "/images/drugLogo.png", label: "ยาเสพติด" },
  ];

  const handleClick = (label) => {
    console.log("Clicked:", label);
  };

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-xl font-bold mb-10">รายการวัตถุพยาน</h1>
      <div className="flex flex-row items-center gap-6">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => handleClick(item.label)}
            className="w-40 h-40 flex items-center justify-center border border-red-800 cursor-pointer hover:shadow-2xl transition duration-300 ease-in-out rounded-lg"
          >
            <div className="flex flex-col items-center justify-center gap-4 p-4">
              <img src={item.image} alt={item.label} className="w-16 h-16 object-contain" />
              <span className="text-red-800 font-medium">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
