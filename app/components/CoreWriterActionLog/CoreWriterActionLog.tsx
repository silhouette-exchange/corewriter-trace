import { AbiCoder, BytesLike } from 'ethers';
import { decodeCoreWriterAction } from './decodeCoreWriterAction';

interface ActionValueOutputProps {
  value: any;
}

const ActionValueOutput = (props: ActionValueOutputProps) => {
  const { value } = props;

  if (typeof value === 'bigint') {
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
    <div className="action-log-card">
      <div className="action-type">{action.type}</div>
      <table className="action-table">
        <tbody>
          {Object.entries(action.data).map(([key, value], i) => {
            return (
              <tr key={i}>
                <td className="action-key">{key}</td>
                <td className="action-value">
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
