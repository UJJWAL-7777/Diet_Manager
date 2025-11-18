import axios from 'axios';

class FoodAPIService {
    constructor() {
        this.usdaApiKey = process.env.USDA_API_KEY;
        this.edamamAppId = process.env.EDAMAM_APP_ID;
        this.edamamAppKey = process.env.EDAMAM_APP_KEY;
        
        // Sample foods database for testing
        this.sampleFoods = this.createSampleFoods();
    }

    // Create sample foods for testing without APIs
    createSampleFoods() {
        return [
            {
                name: 'Apple',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sugar: 10, sodium: 1, cholesterol: 0 },
                category: 'fruits',
                source: 'sample',
                externalId: 'sample-1'
            },
            {
                name: 'Banana',
                brand: 'Generic', 
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sugar: 12, sodium: 1, cholesterol: 0 },
                category: 'fruits',
                source: 'sample',
                externalId: 'sample-2'
            },
            {
                name: 'Chicken Breast',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, cholesterol: 85 },
                category: 'protein',
                source: 'sample', 
                externalId: 'sample-3'
            },
            {
                name: 'Brown Rice',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 123, protein: 2.7, carbs: 26, fat: 1, fiber: 1.8, sugar: 0.4, sodium: 1, cholesterol: 0 },
                category: 'grains',
                source: 'sample',
                externalId: 'sample-4'
            },
            {
                name: 'Broccoli',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'g' },
                nutrition: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33, cholesterol: 0 },
                category: 'vegetables',
                source: 'sample',
                externalId: 'sample-5'
            },
            {
                name: 'Milk',
                brand: 'Generic',
                servingSize: { amount: 100, unit: 'ml' },
                nutrition: { calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0, sugar: 5, sodium: 44, cholesterol: 5 },
                category: 'dairy',
                source: 'sample',
                externalId: 'sample-6'
            },
            {
                name: 'Egg',
                brand: 'Generic',
                servingSize: { amount: 1, unit: 'piece' },
                nutrition: { calories: 72, protein: 6.3, carbs: 0.4, fat: 4.8, fiber: 0, sugar: 0.2, sodium: 71, cholesterol: 186 },
                category: 'protein',
                source: 'sample',
                externalId: 'sample-7'
            },
            {
                name: 'Bread',
                brand: 'Generic', 
                servingSize: { amount: 1, unit: 'slice' },
                nutrition: { calories: 79, protein: 3.1, carbs: 14, fat: 1, fiber: 1.2, sugar: 1.6, sodium: 147, cholesterol: 0 },
                category: 'grains',
                source: 'sample',
                externalId: 'sample-8'
            }
        ];
    }

    // USDA FoodData Central API (Free)
    async searchUSDA(query, pageSize = 10) {
        if (!this.usdaApiKey) {
            console.log('❌ USDA API key not configured - using sample data');
            // Return sample foods that match the query
            return this.sampleFoods.filter(food => 
                food.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, pageSize);
        }

        try {
            const response = await axios.get(
                `https://api.nal.usda.gov/fdc/v1/foods/search`,
                {
                    params: {
                        api_key: this.usdaApiKey,
                        query: query,
                        pageSize: pageSize,
                        dataType: ['Foundation', 'SR Legacy']
                    }
                }
            );

            return response.data.foods.map(food => this.formatUSDAFood(food));
        } catch (error) {
            console.error('❌ USDA API Error:', error.response?.data || error.message);
            return [];
        }
    }

    // Edamam Nutrition API (Free Tier)
    async searchEdamam(query) {
        if (!this.edamamAppId || !this.edamamAppKey) {
            console.log('❌ Edamam API credentials not configured - using sample data');
            // Return sample foods that match the query
            return this.sampleFoods.filter(food => 
                food.name.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5);
        }

        try {
            const response = await axios.get(
                'https://api.edamam.com/api/food-database/v2/parser',
                {
                    params: {
                        app_id: this.edamamAppId,
                        app_key: this.edamamAppKey,
                        ingr: query,
                        nutritionType: 'cooking'
                    }
                }
            );

            return response.data.hints.map(item => this.formatEdamamFood(item));
        } catch (error) {
            console.error('❌ Edamam API Error:', error.response?.data || error.message);
            return [];
        }
    }

    formatUSDAFood(usdaFood) {
        // Extract nutrition data from USDA response
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

        usdaFood.foodNutrients.forEach(nutrient => {
            if (nutrient.nutrientName === 'Protein') {
                nutrients.protein = nutrient.value || 0;
            } else if (nutrient.nutrientName === 'Total lipid (fat)') {
                nutrients.fat = nutrient.value || 0;
            } else if (nutrient.nutrientName === 'Carbohydrate, by difference') {
                nutrients.carbs = nutrient.value || 0;
            } else if (nutrient.nutrientName === 'Energy') {
                nutrients.calories = nutrient.value || 0;
            } else if (nutrient.nutrientName === 'Fiber, total dietary') {
                nutrients.fiber = nutrient.value || 0;
            } else if (nutrient.nutrientName === 'Sugars, total including NLEA') {
                nutrients.sugar = nutrient.value || 0;
            } else if (nutrient.nutrientName === 'Sodium, Na') {
                nutrients.sodium = nutrient.value || 0;
            } else if (nutrient.nutrientName === 'Cholesterol') {
                nutrients.cholesterol = nutrient.value || 0;
            }
        });

        return {
            name: usdaFood.description,
            brand: 'USDA',
            servingSize: {
                amount: 100,
                unit: 'g'
            },
            nutrition: nutrients,
            category: this.categorizeFood(usdaFood.description),
            source: 'usda',
            externalId: usdaFood.fdcId.toString()
        };
    }

    formatEdamamFood(edamamFood) {
        const food = edamamFood.food;
        const nutrients = food.nutrients || {};

        return {
            name: food.label,
            brand: food.category || 'Generic',
            servingSize: {
                amount: 100,
                unit: 'g'
            },
            nutrition: {
                calories: nutrients.ENERC_KCAL || 0,
                protein: nutrients.PROCNT || 0,
                carbs: nutrients.CHOCDF || 0,
                fat: nutrients.FAT || 0,
                fiber: nutrients.FIBTG || 0,
                sugar: nutrients.SUGAR || 0,
                sodium: 0, // Edamam doesn't always provide sodium
                cholesterol: 0
            },
            category: this.categorizeFood(food.label),
            source: 'edamam',
            externalId: food.foodId
        };
    }

    // Categorize food based on name (same as before)
    categorizeFood(foodName) {
        const name = foodName.toLowerCase();
        
        if (name.includes('apple') || name.includes('banana') || name.includes('orange') || 
            name.includes('berry') || name.includes('mango') || name.includes('grape')) 
            return 'fruits';
            
        if (name.includes('broccoli') || name.includes('carrot') || name.includes('spinach') ||
            name.includes('lettuce') || name.includes('tomato') || name.includes('potato'))
            return 'vegetables';
            
        if (name.includes('rice') || name.includes('pasta') || name.includes('bread') ||
            name.includes('oat') || name.includes('wheat') || name.includes('cereal'))
            return 'grains';
            
        if (name.includes('chicken') || name.includes('beef') || name.includes('fish') ||
            name.includes('egg') || name.includes('tofu') || name.includes('bean'))
            return 'protein';
            
        if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') ||
            name.includes('cream') || name.includes('butter'))
            return 'dairy';
            
        if (name.includes('oil') || name.includes('avocado') || name.includes('nut') ||
            name.includes('seed') || name.includes('olive'))
            return 'fats';
            
        return 'other';
    }

    // Search all available APIs
    async searchFoods(query) {
        console.log(`🔍 Searching for: ${query}`);
        
        const results = [];
        
        // Search USDA API (or sample data)
        const usdaResults = await this.searchUSDA(query);
        results.push(...usdaResults);
        
        // Search Edamam API (or sample data) 
        const edamamResults = await this.searchEdamam(query);
        results.push(...edamamResults);

        // Remove duplicates by name
        const uniqueResults = results.filter((food, index, self) =>
            index === self.findIndex(f => f.name === food.name)
        );

        console.log(`✅ Found ${uniqueResults.length} results for "${query}"`);
        
        return uniqueResults;
    }
}

export default new FoodAPIService();