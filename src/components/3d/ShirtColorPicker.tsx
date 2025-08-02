import { useShirtData } from "@/context/ShirtDataContext";

const SHIRT_COLORS = [
  { name: "White", color: "#f8f8f8", description: "Off-white" },
  { name: "Black", color: "#2a2a2a", description: "Charcoal black" },
  { name: "Cream", color: "#f5f5dc", description: "Warm cream" },
  { name: "Navy", color: "#1a1a2e", description: "Deep navy blue" },
  { name: "Charcoal", color: "#4a4a4a", description: "Charcoal grey" },
  { name: "Brown", color: "#3d2817", description: "Dark brown" },
  { name: "Army Green", color: "#1a2f1a", description: "Military green" },
];

export function ShirtColorPicker() {
  const { shirtColor, setShirtColor } = useShirtData();

  return (
    <div className="mb-4 flex justify-center">
      <div className="flex space-x-2">
        {SHIRT_COLORS.map(colorOption => (
          <div key={colorOption.color} className="relative group">
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
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {colorOption.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
