# api-pagination [![Build Status](https://travis-ci.org/davidcelis/api-pagination.png)](https://travis-ci.org/davidcelis/api-pagination)

Put pagination info in a Link header, not the response body.

This is a fork of [davidcelis/api-pagination][api-pagination] that supports Grape rather than Rails.

```ruby
class API < Grape::API

  get :status_feed
    @statuses = Status.page(params[:page])

    paginate(:statuses)

    @statuses
  end

end
```

For more details on usage, see the original. It's basically the same but Grape has no filtering (`before_filter`, `after_filter`, etc.) functionality.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create a new Pull Request

[api-pagination]: https://github.com/davidcelis/api-pagination
