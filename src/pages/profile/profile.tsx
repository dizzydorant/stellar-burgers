import { useDispatch, useSelector } from '../../services/store';
import { ProfileUI } from '@ui-pages';
import { FC, SyntheticEvent, useEffect, useState } from 'react';
import { updateUserThunk } from '../../services/users/actions';
import { TRegisterData } from '@api';
import { selectUser } from '../../services/users/user-slice';

export const Profile: FC = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const [formValue, setFormValue] = useState<Partial<TRegisterData>>({
    name: user?.name || '',
    email: user?.email || '',
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

  if (!user) return null;

  const isPasswordValid = !formValue.password || formValue.password.length >= 6;

  const isFormChanged =
    formValue.name !== user.name ||
    formValue.email !== user.email ||
    (!!formValue.password && formValue.password.trim().length > 0);

  const handleSubmit = (e: SyntheticEvent) => {
    e.preventDefault();

    dispatch(
      updateUserThunk({
        name: formValue.name || user.name,
        email: formValue.email || user.email,
        password: formValue.password || ''
      })
    ).then(() => {
      setFormValue({
        name: formValue.name || user.name,
        email: formValue.email || user.email,
        password: ''
      });
    });
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
