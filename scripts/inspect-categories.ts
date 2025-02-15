import { categoriesService } from '../app/services/categories';

async function inspectCategories() {
  console.log('Fetching all post categories...\n');
  
  try {
    const categories = await categoriesService.getCategories('post');
    console.log('Found', categories.length, 'categories:\n');
    
    categories.forEach(category => {
      console.log(`Category: ${category.name}`);
      console.log(`ID: ${category.id}`);
      console.log(`Slug: ${category.slug}`);
      console.log(`Type: ${category.type}`);
      console.log(`Item Count: ${category.itemCount}`);
      console.log('-------------------\n');
    });

    // Also fetch categories with detailed item counts
    console.log('\nFetching detailed category counts...\n');
    const categoriesWithCounts = await categoriesService.getCategoriesWithItemCount();
    
    categoriesWithCounts.forEach(category => {
      console.log(`\nDetailed info for category: ${category.name}`);
      console.log(`ID: ${category.id}`);
      console.log(`Item Count: ${category.itemCount}`);
      console.log('-------------------\n');
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
  }
}

// Execute the function
inspectCategories().catch(console.error);