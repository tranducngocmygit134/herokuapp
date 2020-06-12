class ApiFeature {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  // 1. Method filter to filter some specified field
  filter() {
    const excludeFields = ['sort', 'page', 'limit', 'fields'];
    let queryObj = { ...this.queryString };

    excludeFields.forEach((el) => delete queryObj[el]);
    // queryObj is an object no exist sort, page, limit, fields
    queryObj = JSON.stringify(queryObj);
    queryObj.replace(/(gt|gte|lt|lte)/, (match) => `$${match}`);
    queryObj = JSON.parse(queryObj);
    this.query = this.query.find(queryObj);
    return this;
  }
  // 2. Sort option
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' '); //"a, b,c "=>convert "a b c"
      // {sort: '-name, id'} => convert to object: a=b=>a: 'b'
      this.query = this.query.sort(sortBy);
    }
    return this;
  }
  // 3. fields option
  fields() {
    if (this.queryString.fields) {
      const selectBy = this.queryString.fields.split(',').join(' '); //"a,b"=>'a b;
      this.query = this.query.select(selectBy);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }
  // 4. pagination
  pagination() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit * 1 || 12;
    //if (page > maxPage) {
    //  // create an global error
    //}
    const skipItems = (page - 1) * limit;
    this.query = this.query.skip(skipItems).limit(limit);
    return this;
  }
}

module.exports = ApiFeature;
