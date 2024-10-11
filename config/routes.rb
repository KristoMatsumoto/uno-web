Rails.application.routes.draw do
  root :to => "home#index"
  get '/login', to: "home#login"

  resources :users, only: [:create, :show]
  resource :sessions, only: [:create, :destroy]
  resources :guests, only: [:create, :destroy]
end
