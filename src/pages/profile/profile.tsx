import { useDispatch, useSelector } from '../../services/store';
import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { updateUserThunk } from '../../services/users/actions';
import { TRegisterData } from '@api';
import { selectUser } from '../../services/users/user-slice';

export const Profile: FC = () => {
  const dispatch = useDispatch();

  /** TODO: взять переменную из стора */
  const user = useSelector(selectUser);
  if (!user) return null;

  const [formValue, setFormValue] = useState<Partial<TRegisterData>>({
    name: user.name,
    email: user.email,
    password: ''
  });

  useEffect(() => {
    if (user) {
      setFormValue({
        name: user.name,
        email: user.email,
        password: ''
      });
    }
  }, [user]);

  const isFormChanged =
    formValue.name !== user?.name ||
    formValue.email !== user?.email ||
    !!formValue.password;

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();
    dispatch(updateUserThunk(formValue))
      .unwrap()
      .then(() => {
        setFormValue((prevState) => ({
          ...prevState,
          password: ''
        }));
      })
      .catch((err) => console.error(err));
  };

  const handleCancel = (e: SyntheticEvent) => {
    e.preventDefault();
    setFormValue({
      name: user.name,
      email: user.email,
      password: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValue((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <ProfileUI
      formValue={{
        name: formValue.name || '',
        email: formValue.email || '',
        password: formValue.password || ''
      }}
      isFormChanged={isFormChanged}
      handleCancel={handleCancel}
      handleSubmit={handleSubmit}
      handleInputChange={handleInputChange}
    />
  );
};
