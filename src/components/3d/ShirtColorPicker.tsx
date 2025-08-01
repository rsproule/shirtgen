import { useShirtData } from "@/context/ShirtDataContext";

const SHIRT_COLORS = [
  { name: "White", color: "#f8f8f8", description: "Off-white" },
  { name: "Black", color: "#2a2a2a", description: "Charcoal black" },
];

export function ShirtColorPicker() {
  const { shirtColor, setShirtColor } = useShirtData();

  return (
    <div className="flex justify-center mb-4">
      <div className="flex space-x-2">
        {SHIRT_COLORS.map((colorOption) => (
          <button
            key={colorOption.color}
            onClick={() => setShirtColor(colorOption.color)}
            className={`w-8 h-8 rounded-full border-2 transition-all ${
              shirtColor === colorOption.color
                ? "border-gray-800 scale-110"
                : "border-gray-300 hover:border-gray-500"
            }`}
            style={{ backgroundColor: colorOption.color }}
            title={`${colorOption.name} (${colorOption.description})`}
            aria-label={`Select ${colorOption.name} shirt color`}
          />
        ))}
      </div>
    </div>
  );
}