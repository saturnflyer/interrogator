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
end
