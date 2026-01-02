#include <iostream>
using namespace std;

int occurrence_last(int arr[], int n, int key)
{
    int idx;
    for (int i = n - 1; i >= 0; i--)
    {
        if (arr[i] == key)
        {
            idx = i;
            return idx;
        }
    }

    return -1;
}

int main()
{
    int n;
    cin >> n;
    int arr[n];
    for (int i = 0; i < n; i++)
    {
        cin >> arr[i];
    }

    int k;
    cin >> k;
    int chal[k];
    for (int i = 0; i < k; i++)
    {
        cin >> chal[i];
    }

    int sum = 0;

    for (int i = 0; i < k; i++)
    {
        int key = chal[i];
        int idx = occurrence_last(arr, n, key);
        sum += idx;
    }

    cout << sum;

    return 0;
}
