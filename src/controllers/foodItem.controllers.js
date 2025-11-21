import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Dish } from "../models/dish.model.js";

const addfoodItem = asyncHandler(async (req, res) => {
  const { name, description, price, category } = req.body;

  // Check required fields
  if ([name, description, category].some(field => !field || field.trim() === "")|| price==null) {
    throw new apiError(400, "All required fields must be provided");
  }

  console.log(req.body);
  
  // Check duplicate food item
  const existedfoodItem = await Dish.findOne({ name });
  if (existedfoodItem) throw new apiError(409, "Food item with this name already exists");

  // Create new item
  const item = await Dish.create({
    name,
    description,
    price,
    category,
  });

  if (!item) throw new apiError(500, "Error while adding item");

  return res.status(201).json(
    new apiResponse(
      201,
      { foodItem: item },
      "Food item created successfully!"
    )
  );
});

const updatefoodItem = asyncHandler(async (req, res) => {

    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    // Check that at least one field is provided
    const noFieldProvided = [name, description, price, category, stock]
        .every(field => field === undefined || field === null || field === "");

    if (noFieldProvided) {
        throw new apiError(400, "At least one field must be provided to update the food item");
    }

    // Update item
    const updatedItem = await Dish.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    });

    if (!updatedItem) throw new apiError(404, "Dish not found");

    return res.status(200).json(
        new apiResponse(200, { updatedItem }, "Food item updated successfully!")
    );
});

const updateImage=asyncHandler((req, res) => {

})

export { addfoodItem, updatefoodItem, updateImage };
