import mongoose from "mongoose";

const spotSchema = new mongoose.Schema({
  spotId: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 16,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
});

const garageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: "Main Garage",
  },
  spots: [spotSchema],
}, { timestamps: true });

const Garage = mongoose.model("Garage", garageSchema);
export default Garage;
