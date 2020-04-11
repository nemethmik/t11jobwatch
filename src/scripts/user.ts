
import $ from 'jquery';

export class UserRepository {
    public fetchUsers(callback: any) {
        $.ajax(
            {
                url: 'https://reqres.in/api/users?page=2',
                method: 'GET'
            }
        ).then((response) => {
            callback(response);
        });
    }
}
