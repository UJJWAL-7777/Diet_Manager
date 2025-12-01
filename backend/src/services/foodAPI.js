import axios from 'axios';
import Food from '../models/Food.js';

class FoodAPIService {
    constructor() {
        this.usdaApiKey = process.env.USDA_API_KEY || "3Ku9P5zBL7JdvzGCXqB5Ouvmg3mV8LfmKeJB9fMR";
        console.log('🥗 FoodAPI - USDA API Enabled');
    }

    async searchFoods(query) {
        if (!query || query.trim().length < 2) return [];
        
        const searchTerm = query.trim();
        console.log(`\n🔍 SEARCHING USDA: "${query}"`);
        
        let results = [];

        // Try USDA API first
        try {
            console.log('1. 🌾 Searching USDA API...');
            const usdaResults = await this.searchUSDA(searchTerm);
            results.push(...usdaResults);
        } catch (error) {
            console.log('❌ USDA failed, using fallback');
        }

        // If no API results, use fallback
        if (results.length === 0) {
            console.log('2. 📚 Using fallback database...');
            results = this.getFallbackFoods(searchTerm.toLowerCase());
        }

        console.log(`🎯 FOUND: ${results.length} results for "${query}"`);
        return results;
    }

    async searchUSDA(query) {
        if (!this.usdaApiKey) {
            console.log('❌ USDA API key not configured');
            return [];
        }

        try {
            console.log(`🌾 Calling USDA API for: "${query}"`);
            
            const response = await axios.get(
                `https://api.nal.usda.gov/fdc/v1/foods/search`,
                {
                    params: {
                        api_key: this.usdaApiKey,
                        query: query,
                        pageSize: 20
                        // REMOVED: dataType and sortBy parameters that were causing issues
                    },
                    timeout: 15000
                }
            );

            console.log(`✅ USDA API response: ${response.data.foods?.length || 0} results`);
            
            if (!response.data.foods || response.data.foods.length === 0) {
                console.log('📭 USDA API returned empty results');
                return [];
            }

            // Filter and format results
            const formattedResults = response.data.foods
                .filter(food => 
                    food.description && 
                    food.description.toLowerCase().includes(query.toLowerCase()) &&
                    food.foodNutrients &&
                    food.foodNutrients.length > 0
                )
                .map(food => this.formatUSDAFood(food))
                .filter(food => food.nutrition.calories > 0); // Only include foods with nutrition data

            console.log(`📦 USDA formatted: ${formattedResults.length} valid foods`);
            return formattedResults;

        } catch (error) {
            console.error('❌ USDA API Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            return [];
        }
    }

    formatUSDAFood(usdaFood) {
        const nutrients = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
            cholesterol: 0
        };

        // Extract nutrition data from USDA response
        if (usdaFood.foodNutrients) {
            usdaFood.foodNutrients.forEach(nutrient => {
                const nutrientId = nutrient.nutrientId;
                const value = nutrient.value || 0;

                // USDA Nutrient IDs
                switch(nutrientId) {
                    case 1008: // Energy (kcal)
                    case 1062: // Energy (kcal) - alternate
                        nutrients.calories = Math.round(value);
                        break;
                    case 1003: // Protein
                        nutrients.protein = Math.round(value * 10) / 10;
                        break;
                    case 1005: // Carbohydrate, by difference
                        nutrients.carbs = Math.round(value * 10) / 10;
                        break;
                    case 1004: // Total lipid (fat)
                        nutrients.fat = Math.round(value * 10) / 10;
                        break;
                    case 1079: // Fiber, total dietary
                        nutrients.fiber = Math.round(value * 10) / 10;
                        break;
                    case 2000: // Sugars, total including NLEA
                        nutrients.sugar = Math.round(value * 10) / 10;
                        break;
                    case 1093: // Sodium, Na
                        nutrients.sodium = Math.round(value);
                        break;
                    case 1253: // Cholesterol
                        nutrients.cholesterol = Math.round(value);
                        break;
                }
            });
        }

        const foodName = usdaFood.description || 'Unknown Food';
        
        return {
            name: foodName,
            brand: usdaFood.brandOwner || 'USDA',
            servingSize: {
                amount: 100,
                unit: 'g'
            },
            nutrition: nutrients,
            category: this.categorizeFood(foodName),
            source: 'usda',
            externalId: usdaFood.fdcId?.toString()
        };
    }

    // Enhanced fallback database
    getFallbackFoods(query) {
        const fallbackDatabase = {
            'avocado': { name: 'Avocado', calories: 160, protein: 2, carbs: 9, fat: 15, fiber: 7, sugar: 0.7, sodium: 7, cholesterol: 0, category: 'fruits' },
            'orange': { name: 'Orange', calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sugar: 9, sodium: 0, cholesterol: 0, category: 'fruits' },
            'apple': { name: 'Apple', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1, cholesterol: 0, category: 'fruits' },
            'banana': { name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1, cholesterol: 0, category: 'fruits' },
            'curd': { name: 'Curd', calories: 98, protein: 11, carbs: 3, fat: 4.3, fiber: 0, sugar: 3, sodium: 36, cholesterol: 17, category: 'dairy' },
            'yogurt': { name: 'Yogurt', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sugar: 4.7, sodium: 46, cholesterol: 13, category: 'dairy' },
            'chicken': { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, cholesterol: 85, category: 'protein' },
            'rice': { name: 'Brown Rice', calories: 123, protein: 2.7, carbs: 26, fat: 1, fiber: 1.8, sugar: 0.4, sodium: 1, cholesterol: 0, category: 'grains' },
            'broccoli': { name: 'Broccoli', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33, cholesterol: 0, category: 'vegetables' },
            'milk': { name: 'Milk', calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44, cholesterol: 5, category: 'dairy' },
            'egg': { name: 'Egg', calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, sugar: 0.2, sodium: 71, cholesterol: 186, category: 'protein' },
            'bread': { name: 'Bread', calories: 79, protein: 3.1, carbs: 14, fat: 1, fiber: 1.2, sugar: 1.6, sodium: 147, cholesterol: 0, category: 'grains' },
            'paneer': { name: 'Paneer', calories: 265, protein: 18, carbs: 1.2, fat: 20, fiber: 0, sugar: 0, sodium: 16, cholesterol: 66, category: 'dairy' },
            'tomato': { name: 'Tomato', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5, cholesterol: 0, category: 'vegetables' },
            'potato': { name: 'Potato', calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6, cholesterol: 0, category: 'vegetables' },
            'carrot': { name: 'Carrot', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69, cholesterol: 0, category: 'vegetables' },
            'spinach': { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79, cholesterol: 0, category: 'vegetables' },
            'fish': { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0, sodium: 59, cholesterol: 55, category: 'protein' },
            'beef': { name: 'Beef', calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sugar: 0, sodium: 65, cholesterol: 80, category: 'protein' },
            'cheese': { name: 'Cheese', calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0, sugar: 0.5, sodium: 621, cholesterol: 105, category: 'dairy' }
        };

        const results = [];
        for (const [key, foodData] of Object.entries(fallbackDatabase)) {
            if (query.includes(key)) {
                results.push({
                    name: foodData.name,
                    brand: 'Generic',
                    servingSize: { amount: 100, unit: 'g' },
                    nutrition: {
                        calories: foodData.calories,
                        protein: foodData.protein,
                        carbs: foodData.carbs,
                        fat: foodData.fat,
                        fiber: foodData.fiber,
                        sugar: foodData.sugar,
                        sodium: foodData.sodium,
                        cholesterol: foodData.cholesterol
                    },
                    category: foodData.category,
                    source: 'fallback'
                });
            }
        }
        return results;
    }

    categorizeFood(foodName) {
        if (!foodName) return 'other';
        const name = foodName.toLowerCase();
        
        if (name.includes('avocado') || name.includes('apple') || name.includes('banana') || 
            name.includes('orange') || name.includes('berry') || name.includes('mango') || 
            name.includes('grape') || name.includes('fruit') || name.includes('peach') ||
            name.includes('pear') || name.includes('plum') || name.includes('cherry')) {
            return 'fruits';
        }
        if (name.includes('broccoli') || name.includes('carrot') || name.includes('spinach') ||
            name.includes('lettuce') || name.includes('tomato') || name.includes('potato') ||
            name.includes('vegetable') || name.includes('cabbage') || name.includes('cauliflower') ||
            name.includes('onion') || name.includes('garlic') || name.includes('pepper') ||
            name.includes('cucumber') || name.includes('zucchini')) {
            return 'vegetables';
        }
        if (name.includes('rice') || name.includes('pasta') || name.includes('bread') ||
            name.includes('oat') || name.includes('wheat') || name.includes('cereal') ||
            name.includes('flour') || name.includes('noodle') || name.includes('quinoa') ||
            name.includes('barley') || name.includes('corn')) {
            return 'grains';
        }
        if (name.includes('chicken') || name.includes('beef') || name.includes('fish') ||
            name.includes('egg') || name.includes('tofu') || name.includes('bean') ||
            name.includes('meat') || name.includes('paneer') || name.includes('lamb') ||
            name.includes('pork') || name.includes('turkey') || name.includes('salmon') ||
            name.includes('tuna') || name.includes('prawn') || name.includes('lentil')) {
            return 'protein';
        }
        if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') ||
            name.includes('cream') || name.includes('butter') || name.includes('curd') ||
            name.includes('dairy') || name.includes('ghee') || name.includes('paneer')) {
            return 'dairy';
        }
        if (name.includes('nut') || name.includes('almond') || name.includes('walnut') ||
            name.includes('peanut') || name.includes('cashew') || name.includes('seed')) {
            return 'nuts';
        }
        return 'other';
    }
}

export default new FoodAPIService();