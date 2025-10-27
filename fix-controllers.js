/**
 * Fix ApiResponse calls in all controllers
 */

// Website Controller fixes
const websiteControllerFixes = [
  {
    old: 'res.status(201).json(\n    ApiResponse.created(website, "Website created successfully")\n  );',
    new: 'ApiResponse.created(res, website, "Website created successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.paginated(result.websites, result.total, result.page, result.limit, result.totalPages, "Websites retrieved successfully")\n  );',
    new: 'ApiResponse.paginated(res, result.websites, result.page, result.limit, result.total, "Websites retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(website, "Website retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, website, "Website retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(website, "Website updated successfully")\n  );',
    new: 'ApiResponse.success(res, website, "Website updated successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(null, "Website deleted successfully")\n  );',
    new: 'ApiResponse.success(res, null, "Website deleted successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(stats, "Website statistics retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, stats, "Website statistics retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(categories, "Categories retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, categories, "Categories retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(niches, "Niches retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, niches, "Niches retrieved successfully");',
  },
];

// Order Controller fixes
const orderControllerFixes = [
  {
    old: 'res.status(201).json(\n    ApiResponse.created(order, "Order created successfully")\n  );',
    new: 'ApiResponse.created(res, order, "Order created successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.paginated(result.orders, result.total, result.page, result.limit, result.totalPages, "Orders retrieved successfully")\n  );',
    new: 'ApiResponse.paginated(res, result.orders, result.page, result.limit, result.total, "Orders retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(order, "Order retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, order, "Order retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(order, "Order updated successfully")\n  );',
    new: 'ApiResponse.success(res, order, "Order updated successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(null, "Order deleted successfully")\n  );',
    new: 'ApiResponse.success(res, null, "Order deleted successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(order, "Order completed successfully")\n  );',
    new: 'ApiResponse.success(res, order, "Order completed successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(stats, "Order statistics retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, stats, "Order statistics retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(orders, "User orders retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, orders, "User orders retrieved successfully");',
  },
];

// FundRequest Controller fixes
const fundRequestControllerFixes = [
  {
    old: 'res.status(201).json(\n    ApiResponse.created(fundRequest, "Fund request created successfully")\n  );',
    new: 'ApiResponse.created(res, fundRequest, "Fund request created successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.paginated(result.fundRequests, result.total, result.page, result.limit, result.totalPages, "Fund requests retrieved successfully")\n  );',
    new: 'ApiResponse.paginated(res, result.fundRequests, result.page, result.limit, result.total, "Fund requests retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(fundRequest, "Fund request retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, fundRequest, "Fund request retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(fundRequest, "Fund request updated successfully")\n  );',
    new: 'ApiResponse.success(res, fundRequest, "Fund request updated successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(null, "Fund request deleted successfully")\n  );',
    new: 'ApiResponse.success(res, null, "Fund request deleted successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(fundRequest, "Fund request approved successfully")\n  );',
    new: 'ApiResponse.success(res, fundRequest, "Fund request approved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(fundRequest, "Fund request rejected successfully")\n  );',
    new: 'ApiResponse.success(res, fundRequest, "Fund request rejected successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(stats, "Fund request statistics retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, stats, "Fund request statistics retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(fundRequests, "User fund requests retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, fundRequests, "User fund requests retrieved successfully");',
  },
];

// Blog Controller fixes
const blogControllerFixes = [
  {
    old: 'res.status(201).json(\n    ApiResponse.created(blogPost, "Blog post created successfully")\n  );',
    new: 'ApiResponse.created(res, blogPost, "Blog post created successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.paginated(result.blogPosts, result.total, result.page, result.limit, result.totalPages, "Blog posts retrieved successfully")\n  );',
    new: 'ApiResponse.paginated(res, result.blogPosts, result.page, result.limit, result.total, "Blog posts retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.paginated(result.blogPosts, result.total, result.page, result.limit, result.totalPages, "Published blog posts retrieved successfully")\n  );',
    new: 'ApiResponse.paginated(res, result.blogPosts, result.page, result.limit, result.total, "Published blog posts retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(blogPost, "Blog post retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, blogPost, "Blog post retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(blogPost, "Blog post retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, blogPost, "Blog post retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(blogPost, "Blog post updated successfully")\n  );',
    new: 'ApiResponse.success(res, blogPost, "Blog post updated successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(null, "Blog post deleted successfully")\n  );',
    new: 'ApiResponse.success(res, null, "Blog post deleted successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(blogPost, "Blog post published successfully")\n  );',
    new: 'ApiResponse.success(res, blogPost, "Blog post published successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(stats, "Blog post statistics retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, stats, "Blog post statistics retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(categories, "Categories retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, categories, "Categories retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(tags, "Tags retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, tags, "Tags retrieved successfully");',
  },
  {
    old: 'res.json(\n    ApiResponse.success(relatedPosts, "Related blog posts retrieved successfully")\n  );',
    new: 'ApiResponse.success(res, relatedPosts, "Related blog posts retrieved successfully");',
  },
];

console.log("Controller fixes defined");
