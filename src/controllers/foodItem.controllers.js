import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Dish } from "../models/dish.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

const updateImage = asyncHandler(async (req, res) => {

  const { id } = req.params;

  const imageBuffer = req.file?.buffer;   // ✔ CORRECT for multer memoryStorage

  if (!imageBuffer) {
    throw new apiError(400, "Image file is missing");
  }

  const imageFile = await uploadOnCloudinary(imageBuffer);

  if (!imageFile) {
    throw new apiError(500, "Error while uploading image");
  }

  const foodItem = await Dish.findByIdAndUpdate(
    id,
    { $set: 
      { 
        image: imageFile.secure_url 
      } 
    },
    { 
      new: true, 
      runValidators: true 
    }
  );

  if (!foodItem) {
    throw new apiError(404, "Item not found");
  }

  return res
  .status(200)
  .json(
    new apiResponse(200, foodItem, "Item image updated successfully!")
  );
});

const deletefoodItem = asyncHandler(async (req, res) => {
  const {id} = req.params;

  const foodItem = await Dish.findByIdAndDelete(id);

  if(!foodItem) throw new apiError(404,"food item not found!")

  return res
  .status(200)
  .json(
    new apiResponse(200,"Item deleted successfully!")
  )
})

const getAllItems = asyncHandler(async (req,res) => {
  const allItems = await Dish.find();

  if(!allItems) throw new apiError(500, "Items are not able to fetch");

  return res
  .status(200)
  .json(
    new apiResponse(
      200,
      allItems.length,
      allItems,
      "Food items fetched successfully")
  )
})

const foodItem = asyncHandler(async (req,res) => {
  const {id} = req.params;

  const item = await Dish.findById(id);

  if (!item) {
    throw new apiError(404, "Item not found");
  }

  return res
  .status(200)
  .json(
    new apiResponse(
      200,
      item,
      "Food item fetched successfully")
  )
})

const getFoods = asyncHandler(async (req, res) => {

  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 5,
  } = req.query;

  let query = {};

  //  Search
  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  //  Category filter
  if (category) {
    query.category = category;
  }

  //  Price filter
  if (minPrice || maxPrice) {
    query.price = {};

    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  //  Sort options
  let sortOption = {};

  if (sort === "price_low_high") {
    sortOption.price = 1;
  }

  if (sort === "price_high_low") {
    sortOption.price = -1;
  }

  if (sort === "newest") {
    sortOption.createdAt = -1;
  }

  //  Pagination logic
  const skip = (Number(page) - 1) * Number(limit);

  const foods = await Dish.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  const total = await Dish.countDocuments(query);

  return res.status(200).json(
    new apiResponse(
      200,
      {
        count: foods.length,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        foods,
      },
      "Here are all listed Items"
    )
  );
});


export {addfoodItem, updatefoodItem, updateImage, deletefoodItem, getAllItems, foodItem, getFoods};
