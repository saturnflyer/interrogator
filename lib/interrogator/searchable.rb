module Interrogator
  class Searchable
  
    class_inheritable_accessor :excluded_models
    self.excluded_models ||= []
    
    Rails.configuration.load_paths.map{|p| p.sub(/\/$/,'')}.uniq.delete_if{|p| !p.match(/models/)}.each do |load_path|
      Dir.glob(File.join(load_path, '**', 'models', '**', '*.rb')).each { |file|
        unless file.match(/test|spec/) 
          require file
        end
      }
    end
  
    class << self
      def models(opts={})
        excluded = excluded_models
        if opts[:exclude]
          excluded << opts[:exclude]
          excluded.uniq!
        end
        (Object.subclasses_of(ActiveRecord::Base).delete_if{ |klass| 
          excluded.any?{ |e| 
            e.to_s == klass.to_s 
          }
        }).sort_by{|klass| klass.name}
      end
    end
  end
end