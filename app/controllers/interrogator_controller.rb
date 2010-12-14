class InterrogatorController < ApplicationController
  def show
    param_class = (params[:klass] || 'Complaint').camelize(:upper)
    klass = param_class.constantize 
    respond_to do |format|
      format.js { render :json => [
        {
          :columns_hash => klass.columns_hash,
          :associations => klass.associated_models_hash
        }
      ]}
    end
  end
end
