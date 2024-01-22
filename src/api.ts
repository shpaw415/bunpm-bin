export async function sendPackage({
  api_key,
  formdata,
  packageName,
}: {
  api_key: string;
  formdata: FormData;
  packageName: string;
}) {
  const url = process.env.BASE_URL as string;
  const res = await fetch(`${url}/api/v1/package`, {
    method: "POST",
    headers: {
      "API-Key": api_key,
      "package-name": packageName,
    },
    body: formdata,
  });
  if (!res.ok) throw new Error("cannot send package to the server");
  const data = (await res.json()) as
    | { status: false; message: string }
    | { status: true };
  data.status ? null : console.log(data.message);
  return data.status;
}

export async function testApiKey({ api_key }: { api_key: string }) {
  const url = process.env.BASE_URL as string;
  console.log(url);
  const res = await fetch(`${url}/api/v1/key`, {
    method: "GET",
    headers: {
      "API-Key": api_key,
    },
  });
  if (!res.ok)
    throw new Error("the request ended unexpetedly with code: " + res.status);
  const data = (await res.json()) as { status: boolean };
  return data.status;
}

export async function PackageExists(name: string) {
  const url = process.env.BASE_URL as string;
  const res = await fetch(`${url}/api/v1/package?name=${name}`);
  if (!res.ok) throw new Error("cannot connect to server");
  return (await res.json()) as {
    status: boolean;
    version: Array<string>;
    message: string;
    name: string;
  };
}
