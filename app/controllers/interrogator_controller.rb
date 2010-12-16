class InterrogatorController < ApplicationController
  def show
    respond_to do |format|
      format.json do
        param_class = params[:klass].to_s.camelize(:upper)
        details = {}
        if param_class.present?
          klass = param_class.constantize
          details[:columns] = klass.simple_columns_array
          details[:associations] = klass.associated_models_hash
        end
        render :json => details
      end
      format.js do
        query_options = {}
        query_options.tap do |hash|
          Interrogator::Conditions.constants.each do |konstant|
            hash[konstant.to_sym] = Interrogator::Conditions.const_get(konstant.to_sym)
          end
        end
        render :json => query_options
      end
    end
  end
end
