StealthStars::Application.routes.draw do
  resources :missions, :only => :index
  resources :top_secret_docs, :only => [:index, :show]
  resources :operatives, :only => :index

  root :to => "home#index"
end
