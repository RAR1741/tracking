# frozen_string_literal: true

module Users
  class SessionsController < Devise::SessionsController
    # For development mode, we're going to make a base user if
    # the developer doesn't have any in their database. We also
    # present a drop down field on the login page instead of the
    # usual form for quick login locally.
    #
    # For all other environments, actions will be the devise
    # controller defaults.
    if Rails.env.development?
      def new
        User.system_user unless User.exists?

        super
      end
    end
  end
end
