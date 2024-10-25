Rails.application.routes.draw do
  root :to => "home#index"
  get '/login', to: "home#login"

  resources :users, only: [:new, :create, :show]
  resource :sessions, only: [:new, :create, :destroy]
  # resources :guests, only: [:create, :destroy]

  resources :rooms, only: [:new, :create, :show]
  post '/rooms/join', to: 'rooms#join', as: 'rooms_join'
  delete '/rooms/:room_id/leave/:player_num', to: 'rooms#leave', as: 'rooms_leave'
  post '/rooms/:id/start', to: 'rooms#start', as: 'room_game_start'
end
