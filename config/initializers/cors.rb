Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV['SOCKET_PATH']

    resource '*',
      headers: :any,
      methods: [:get, :post, :options, :put, :patch, :delete]
      #  credentials: true  # allow the transfer of cookies if they are used
  end
end