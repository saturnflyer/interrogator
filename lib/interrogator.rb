require 'active_record'

module Interrogator
  def simple_columns_hash
    return @h if @h
    @h = {}
    columns_hash.each{|k, v|
      @h[k] = {:type => v.type,
        :limit => v.limit,
        :null => v.null
      }
    }
    @h
  end
  def associated_models_hash
    result = {
      :has_many => [],
      :has_one => [],
      :belongs_to => []
    }
    [:has_many, :has_one, :belongs_to].each do |assoc|
      reflect_on_all_associations(assoc).each do |reflection|
        result[assoc] << {:name => reflection.name, :options => reflection.options.tap{|o| o.delete(:extend)}}
      end
    end
   result
  end
end

ActiveRecord::Base.send(:extend, Interrogator)
