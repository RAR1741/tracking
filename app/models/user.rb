class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :confirmable, :database_authenticatable, :lockable, :registerable,
         :recoverable, :rememberable, :timeoutable, :trackable, :validatable

  SYSTEM_USER_ID = -1

  def self.system_user
    user = find_by(id: SYSTEM_USER_ID)
    unless user
      user = new(id: SYSTEM_USER_ID, email: "admin@redalert1741.org")
      user.set_random_password
      # first_user.roles = Permission::ROLES.keys
      user.save!
      user.confirm
    end
    user
  end

  def set_random_password
    return false unless new_record?

    pass = SecureRandom.urlsafe_base64(32, true)
    self.password = pass
    self.password_confirmation = pass
  end
end
