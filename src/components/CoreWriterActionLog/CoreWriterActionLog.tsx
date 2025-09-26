import { AbiCoder, BytesLike } from "ethers";
import { decodeCoreWriterAction } from "./decodeCoreWriterAction";

interface ActionValueOutputProps {
  value: any;
}

const ActionValueOutput = (props: ActionValueOutputProps) => {
  const { value } = props;

  if (typeof value === "bigint") {
    return value.toString();
  }

  return value.toString();
};

interface CoreWriterActionLogProps {
  data: string;
}

export const CoreWriterActionLog = (props: CoreWriterActionLogProps) => {
  const { data } = props;

  const action = decodeCoreWriterAction(data);

  return (
    <div style={{ marginTop: "2rem" }}>
      <div>{action.type}</div>
      <table>
        <tbody>
          {Object.entries(action.data).map(([key, value], i) => {
            return (
              <tr key={i}>
                <td style={{ fontWeight: "bold" }}>{key}</td>
                <td>
                  <ActionValueOutput value={value} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
