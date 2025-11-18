import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    // Personal Information
    age: {
        type: Number,
        min: 13,
        max: 120
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    height: {
        type: Number, // in cm
        min: 100,
        max: 250
    },
    weight: {
        type: Number, // in kg
        min: 30,
        max: 300
    },
    // Goals
    goal: {
        type: String,
        enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain'],
        default: 'maintenance'
    },
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
        default: 'moderate'
    },
    // Dietary Preferences
    dietaryRestrictions: [{
        type: String,
        enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'keto', 'paleo']
    }],
    allergies: [String],
    // Nutrition Targets (calculated based on profile)
    dailyCalories: {
        type: Number,
        default: 2000
    },
    proteinTarget: {
        type: Number, // in grams
        default: 50
    },
    carbsTarget: {
        type: Number, // in grams
        default: 250
    },
    fatTarget: {
        type: Number, // in grams
        default: 70
    },
    // Settings
    mealCount: {
        type: Number,
        default: 3,
        min: 1,
        max: 6
    }
}, {
    timestamps: true
});

// Calculate nutrition targets based on user data
userProfileSchema.methods.calculateTargets = function() {
    // Basic BMR calculation (simplified)
    let bmr;
    if (this.gender === 'male') {
        bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age + 5;
    } else {
        bmr = 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;
    }

    // Activity multiplier
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };

    let maintenanceCalories = bmr * (activityMultipliers[this.activityLevel] || 1.55);

    // Goal adjustment
    if (this.goal === 'weight_loss') {
        maintenanceCalories -= 500;
    } else if (this.goal === 'weight_gain' || this.goal === 'muscle_gain') {
        maintenanceCalories += 500;
    }

    this.dailyCalories = Math.round(maintenanceCalories);
    this.proteinTarget = Math.round((this.dailyCalories * 0.3) / 4); // 30% of calories from protein
    this.fatTarget = Math.round((this.dailyCalories * 0.25) / 9); // 25% of calories from fat
    this.carbsTarget = Math.round((this.dailyCalories * 0.45) / 4); // 45% of calories from carbs

    return this;
};

export default mongoose.model('UserProfile', userProfileSchema);