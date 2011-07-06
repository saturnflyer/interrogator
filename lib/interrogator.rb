require 'active_record'
require 'interrogator/detailer'
begin
  require 'searchlogic'
rescue LoadError
  STDERR.puts "Interrogator uses Searchlogic to provide query options. You'll need to define these yourself if you don't intend to use Searchlogic"
end
ActiveRecord::Base.extend(Interrogator::Detailer)
