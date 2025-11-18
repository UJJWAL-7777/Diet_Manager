import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    weight: {
        type: Number,
        min: 30,
        max: 300
    },
    measurements: {
        chest: Number,
        waist: Number,
        hips: Number,
        arms: Number,
        thighs: Number
    },
    photos: [String], // URLs to stored photos
    notes: String,
    mood: {
        type: String,
        enum: ['excellent', 'good', 'okay', 'poor', 'terrible']
    },
    energyLevel: {
        type: Number,
        min: 1,
        max: 10
    }
}, {
    timestamps: true
});

// Index for efficient querying
progressSchema.index({ userId: 1, date: -1 });

export default mongoose.model('Progress', progressSchema);