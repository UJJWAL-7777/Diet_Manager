import mongoose from 'mongoose';

const mealItemSchema = new mongoose.Schema({
    food: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Food',
        required: true
    },
    servingSize: {
        amount: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true
        }
    },
    customName: String // Optional custom name for the food item
});

const mealSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        enum: ['breakfast', 'lunch', 'dinner', 'snack-1', 'snack-2', 'snack-3']
    },
    items: [mealItemSchema],
    totalNutrition: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 }
    }
});

const mealPlanSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    meals: [mealSchema],
    dailyTotal: {
        calories: { type: Number, default: 0 },
        protein: { type: Number, default: 0 },
        carbs: { type: Number, default: 0 },
        fat: { type: Number, default: 0 }
    },
    notes: String
}, {
    timestamps: true
});

// Index for efficient querying
mealPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('MealPlan', mealPlanSchema);