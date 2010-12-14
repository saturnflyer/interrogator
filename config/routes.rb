ActionController::Routing::Routes.draw do |map|
  map.resource :interrogator, :only => :show, :controller => 'interrogator'
end

