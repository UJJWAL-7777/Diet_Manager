import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    brand: {
        type: String,
        trim: true,
        default: 'Generic'
    },
    
    // Serving Information
    servingSize: {
        amount: {
            type: Number,
            required: true
        },
        unit: {
            type: String,
            required: true,
            enum: ['g', 'ml', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'oz']
        }
    },
    
    // Nutrition Facts (per serving)
    nutrition: {
        calories: { type: Number, required: true, min: 0 },
        protein: { type: Number, required: true, min: 0 },
        carbs: { type: Number, required: true, min: 0 },
        fat: { type: Number, required: true, min: 0 },
        fiber: { type: Number, default: 0, min: 0 },
        sugar: { type: Number, default: 0, min: 0 },
        sodium: { type: Number, default: 0, min: 0 },
        cholesterol: { type: Number, default: 0, min: 0 }
    },
    
    // Categorization
    category: {
        type: String,
        enum: [
            'fruits', 'vegetables', 'grains', 'protein', 'dairy', 
            'fats', 'beverages', 'snacks', 'condiments', 'other'
        ],
        required: true
    },
    
    // Source Tracking
    source: {
        type: String,
        enum: ['usda', 'nutritionix', 'edamam', 'custom'],
        default: 'custom'
    },
    externalId: String, // ID from external API
    
    // Management
    tags: [String],
    isPublic: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

// Index for search
foodSchema.index({ name: 'text', brand: 'text' });

export default mongoose.model('Food', foodSchema);