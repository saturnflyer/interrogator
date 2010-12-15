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
    reflect_on_all_associations(:has_many).each do |reflection|
      result[:has_many] << {:name => reflection.name, :options => reflection.options.not(:extend)}
    end
    reflect_on_all_associations(:has_one).each do |reflection|
      result[:has_one] << {:name => reflection.name, :options => reflection.options.not(:extend)}
    end
    reflect_on_all_associations(:belongs_to).each do |reflection|
      result[:belongs_to] << {:name => reflection.name, :options => reflection.options.not(:extend)}
    end
    result
  end
end

unless Hash.instance_methods.include?(:not)
  class Hash
    def not(which)
      self.tap{ |h| h.delete(which) }
    end
  end
end


ActiveRecord::Base.send(:extend, Interrogator)
