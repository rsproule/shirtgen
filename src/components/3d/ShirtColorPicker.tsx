import { useShirtData } from "@/context/ShirtDataContext";

const SHIRT_COLORS = [
  { name: "White", color: "#f8f8f8", description: "Off-white" },
  { name: "Shadow", color: "#2a2a2a", description: "Charcoal black" },
  { name: "Oatmeal", color: "#d2b48c", description: "Warm oatmeal" },
  { name: "Cream", color: "#f5f5dc", description: "Warm cream" },
];

export function ShirtColorPicker() {
  const { shirtColor, setShirtColor } = useShirtData();

  return (
    <div className="mb-4 flex justify-center">
      <div className="flex space-x-2">
        {SHIRT_COLORS.map(colorOption => (
          <div key={colorOption.color} className="group relative">
            <button
              onClick={() => setShirtColor(colorOption.color)}
              className={`h-8 w-8 rounded-full border-2 transition-all ${
                shirtColor === colorOption.color
                  ? "scale-110 border-gray-800"
                  : "border-gray-300 hover:border-gray-500"
              }`}
              style={{ backgroundColor: colorOption.color }}
              aria-label={`Select ${colorOption.name} shirt color`}
            />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
              {colorOption.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
